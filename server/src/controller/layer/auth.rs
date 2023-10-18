//! Authentication & Authorization middlewares.
//!

use axum::{
    extract::State,
    http::{header, Request, StatusCode},
    middleware::Next,
    response::IntoResponse,
    Extension,
};
use chrono::Local;
use futures::TryFutureExt;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use sea_orm::DatabaseConnection;
use serde::{Deserialize, Serialize};
use std::sync::{atomic::AtomicBool, Arc};
use tokio::sync::Mutex;
use tracing::{debug, error};

use crate::{
    cache::{self, manager::RedisPool},
    config::GlobalConfig,
    entity::{
        challenge,
        config::{Auth, Model as ConfigModel},
        game,
        team::get_team_by_user_id,
        user::{self, Permission, Permissions},
    },
};

#[derive(Clone, Debug, Serialize, Deserialize, Default)]
pub struct Token {
    pub id: i64,
    pub name: String,
    pub permissions: Permissions,
    pub exp: i64,
}

#[derive(Clone, Debug)]
pub struct TokenTracker {
    pub token: Arc<Mutex<Token>>,
    pub renew_requested: Arc<AtomicBool>,
    pub original: Option<String>,
}

pub async fn decode_token(token: &str, key: &str) -> Token {
    let token_data = match decode::<Token>(
        token,
        &DecodingKey::from_secret(key.as_ref()),
        &Validation::new(Algorithm::HS256),
    ) {
        Ok(c) => c,
        Err(err) => {
            debug!("decode token failed: {err:?}, token is {token:?}");
            return Token {
                id: -1,
                ..Default::default()
            };
        }
    };
    token_data.claims
}

async fn distribute_token(token: &Token, key: &str, expires_time: i64) -> String {
    let new_token = Token {
        exp: Local::now().timestamp() + expires_time,
        ..token.clone()
    };
    let token = encode(
        &Header::default(),
        &new_token,
        &EncodingKey::from_secret(key.as_ref()),
    )
    .expect("Failed to encode token");
    token
}

pub async fn extract_user_info<B>(
    State(ref mut cache): State<RedisPool>,
    config: Option<Extension<ConfigModel>>,
    mut req: Request<B>,
    next: Next<B>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    if let Some(Extension(config)) = config {
        let auth_config = config.auth;
        let Auth {
            ref signing_key,
            buffer_time,
            expires_time,
        } = auth_config;
        let auth_header = req
            .headers()
            .get(header::AUTHORIZATION)
            .and_then(|header| header.to_str().ok());

        let auth_header = if let Some(auth_header) = auth_header {
            auth_header
                .strip_prefix("Bearer ")
                .unwrap_or(auth_header)
                .trim()
        } else {
            ""
        };

        let auth_header = match cache::Token::validate(cache, auth_header).await {
            Ok(()) => String::from(auth_header),
            Err(err) => {
                debug!("validate token failed: {}", err);
                String::new()
            }
        };

        let token = decode_token(&auth_header, signing_key).await;
        debug!("user requested with token {token:?}");

        let last_time = token.exp - Local::now().timestamp();

        let token_tracker = TokenTracker {
            token: Arc::new(Mutex::new(token.clone())),
            renew_requested: Arc::new(AtomicBool::new(last_time > 0 && last_time < buffer_time)),
            original: Some(auth_header.clone()),
        };

        req.extensions_mut().insert(token_tracker.clone());
        req.extensions_mut().insert(token.clone());

        let mut resp = next.run(req).await;

        if token_tracker
            .renew_requested
            .load(std::sync::atomic::Ordering::Relaxed)
        {
            cache::Token::revoke(cache, &auth_header).await.ok();
            let token_stored = token_tracker.token.lock().await.clone();
            let token_str = distribute_token(&token_stored, signing_key, expires_time).await;
            cache::Token::store(cache, token_stored.id, &token_str)
                .await
                .map_err(|err| {
                    error!("failed to store new token: {:?}", err);
                })
                .ok();
            resp.headers_mut().insert(
                "Set-Token",
                token_str.parse().expect("failed to parse token"),
            );
        }

        Ok(resp)
    } else {
        req.extensions_mut().insert(Token::default());
        req.extensions_mut().insert(TokenTracker {
            token: Arc::new(Mutex::new(Token::default())),
            renew_requested: Arc::new(AtomicBool::new(false)),
            original: None,
        });
        Ok(next.run(req).await)
    }
}

/// Construct a middleware closure that validate permissions from token.
///
/// all the permissions appeared here should be in the `permissions` field in user's token.
///
/// Usage:
///
/// ```
/// Router::new()
///     .route(...)
///     .route_layer(axum::middleware::from_fn(permission_required_all!(Permission::Basic, ...)))
/// ```
macro_rules! permission_required_all {
    ($($perm:expr),*) => {
        |
            axum::extract::Extension(token): axum::extract::Extension<crate::controller::layer::auth::Token>,
            req: axum::http::Request<_>,
            next: axum::middleware::Next<_>,
        | async move {
            if token.id <= 0 {
                return Err((axum::http::StatusCode::UNAUTHORIZED, "please login first"));
            }
            let required_perms = [$($perm),*];
            tracing::debug!("user permissions: {:?}", token.permissions.0);
            tracing::debug!("required perms: {:?}", required_perms);
            match required_perms.iter().all(|perm| token.permissions.0.contains(perm)) {
                true => Ok(next.run(req).await),
                false => Err((axum::http::StatusCode::FORBIDDEN, "permission denied"))
            }
        }
    };
}

macro_rules! permission_required_any {
    ($($perm:expr),*) => {
        |
            axum::extract::Extension(token): axum::extract::Extension<crate::controller::layer::auth::Token>,
            req: axum::http::Request<_>,
            next: axum::middleware::Next<_>,
        | async move {
            if token.id <= 0 {
                return Err((axum::http::StatusCode::UNAUTHORIZED, "please login first"));
            }
            let required_perms = [$($perm),*];
            tracing::debug!("user permissions: {:?}", token.permissions.0);
            tracing::debug!("required perms: {:?}", required_perms);
            match required_perms.iter().any(|perm| token.permissions.0.contains(perm)) {
                true => Ok(next.run(req).await),
                false => Err((axum::http::StatusCode::FORBIDDEN, "permission denied"))
            }
        }
    };
}

macro_rules! pass_admin_for_game {
    ($permissions:expr) => {{
        let admin_perms = [Permission::Devops, Permission::Organize, Permission::Audit];
        admin_perms.iter().any(|perm| $permissions.contains(perm))
    }};
}

pub(crate) use permission_required_all;
pub(crate) use permission_required_any;

pub async fn init_token_or_permission_required<B>(
    State(config): State<GlobalConfig>,
    Extension(token): Extension<Token>,
    platform_info: Option<Extension<ConfigModel>>,
    req: Request<B>,
    next: Next<B>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    let init_token = req
        .headers()
        .get("Authorization")
        .and_then(|header| header.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "))
        .map(|token| token.to_owned());
    debug!("user init token is: {:?}", init_token);
    match init_token {
        Some(token_str) => {
            debug!(
                "platform init token is: {}",
                config.server.init_token.trim()
            );
            if token_str.trim() == config.server.init_token.trim() {
                if platform_info.is_some() {
                    return Err((StatusCode::CONFLICT, "already configured"));
                }
                Ok(next.run(req).await)
            } else {
                #[allow(clippy::redundant_closure_call)]
                permission_required_all!(Permission::Devops)(Extension(token), req, next).await
            }
        }
        None => Err((StatusCode::FORBIDDEN, "permission denied")),
    }
}

pub async fn challenge_privilege_required<B>(
    State(ref db): State<DatabaseConnection>,
    Extension(user): Extension<user::Model>,
    Extension(challenge): Extension<challenge::Model>,
    req: Request<B>,
    next: Next<B>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    if pass_admin_for_game!(user.permissions.0) {
        return Ok(next.run(req).await.into_response());
    }
    let game = game::get_game(db, challenge.game_id).await.map_err(|err| {
        error!("get_game error: {}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "failed to get game by id",
        )
    })?;
    if let Some(game) = game {
        let resp = game_player_privilege_required(
            State(db.clone()),
            Extension(user),
            Some(Extension(game)),
            req,
            next,
        )
        .await?;
        Ok(resp.into_response())
    } else {
        Err((StatusCode::NOT_FOUND, "game not found"))
    }
}

// can take part in a game
pub async fn game_participate_privilege_required<B>(
    State(ref db): State<DatabaseConnection>,
    Extension(user): Extension<user::Model>,
    Extension(game): Extension<game::Model>,
    req: Request<B>,
    next: Next<B>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    // pass admin
    if pass_admin_for_game!(user.permissions.0) {
        return Ok(next.run(req).await);
    }
    if game.hidden || game.frozen {
        return Err((StatusCode::FORBIDDEN, "game is not available"));
    }
    if !game.host_as_game {
        return Err((
            StatusCode::FORBIDDEN,
            "playground is not allowed to take part in",
        ));
    }
    if game.end_and_archive()
        || game.end_but_not_archive()
        || (game.in_progress() && !game.can_register_after_started)
    {
        if get_team_by_user_id(db, game.id, user.id)
            .map_err(|err| {
                error!("get_team_by_user_id error: {}", err);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "failed to get team by user id",
                )
            })
            .await?
            .is_some()
        {
            Ok(next.run(req).await)
        } else {
            Err((StatusCode::FORBIDDEN, "it's too late to join this game"))
        }
    } else {
        // check if user can join this game
        // if before register time
        if game.register_time < Local::now() {
            if game.institute_id.is_some_and(|game_institute| {
                user.institute_id
                    .is_some_and(|user_institute| user_institute != game_institute)
            }) {
                Err((
                    StatusCode::FORBIDDEN,
                    "game is restricted for another institute",
                ))
            } else {
                Ok(next.run(req).await)
            }
        } else {
            Err((StatusCode::FORBIDDEN, "game is not open for register now"))
        }
    }
}

pub async fn game_player_privilege_required<B>(
    State(ref db): State<DatabaseConnection>,
    Extension(user): Extension<user::Model>,
    game: Option<Extension<game::Model>>,
    req: Request<B>,
    next: Next<B>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    // pass admin
    if pass_admin_for_game!(user.permissions.0) {
        return Ok(next.run(req).await);
    }
    if game.is_none() {
        return Err((StatusCode::NOT_FOUND, "game not found"));
    }
    let Extension(game) = game.unwrap();
    if game.hidden || game.frozen {
        return Err((StatusCode::FORBIDDEN, "game is not available"));
    }
    // playground is open for everyone.
    if !game.host_as_game {
        return Ok(next.run(req).await);
    }
    if game.end_and_archive() {
        return Ok(next.run(req).await);
    } else if game.in_progress() || game.end_but_not_archive() {
        if get_team_by_user_id(db, game.id, user.id)
            .map_err(|err| {
                error!("get_team_by_user_id error: {}", err);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "failed to get team by user id",
                )
            })
            .await?
            .is_some()
        {
            Ok(next.run(req).await)
        } else {
            Err((StatusCode::FORBIDDEN, "you have not joined this game"))
        }
    } else {
        Err((StatusCode::FORBIDDEN, "game has not started"))
    }
}
