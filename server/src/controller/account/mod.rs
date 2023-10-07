mod captcha;

use axum::middleware;
use axum::routing::patch;
use axum::{
    extract::State, http::StatusCode, response::IntoResponse, routing::post, Extension, Json,
    Router,
};
use sea_orm::{DatabaseConnection, DbErr};
use serde::{Deserialize, Serialize};
use tracing::{debug, error, warn, info};

use super::layer::auth::{permission_required_all, Token, TokenTracker};
use super::layer::info;
use crate::cache;
use crate::captcha::captcha_protected;
use crate::entity::config::Model as ConfigModel;
use crate::entity::user::{self, count_user, create_user, Permissions};
use crate::{cache::manager::RedisPool, controller::GlobalState, entity::user::Permission};

pub fn router(state: &GlobalState) -> Router<GlobalState> {
    Router::new()
        .route("/change-password", patch(change_password))
        .route("/self", patch(update_self_setting))
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            info::prepare_user_full_info,
        ))
        .route("/logout", post(logout))
        .route_layer(middleware::from_fn(permission_required_all!(
            Permission::Basic
        )))
        .route("/login", post(login))
        .route("/register", post(register))
        .nest("/captcha", captcha::router(state))
}

#[derive(Debug, Serialize, Deserialize)]
struct LoginRequest {
    pub account: String,
    pub password: String,
    pub captcha_id: String,
    pub captcha_answer: String,
}

async fn login(
    State(ref db): State<DatabaseConnection>,
    State(ref mut cache): State<RedisPool>,
    Extension(config): Extension<ConfigModel>,
    Extension(token): Extension<Token>,
    Extension(token_tracker): Extension<TokenTracker>,
    Json(body): Json<LoginRequest>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    debug!("login request: {:?}", body);
    if token.id >= 0 {
        return Err((StatusCode::CONFLICT, "you are already logged in"));
    }
    let captcha_config = &config.captcha;
    captcha_protected!(
        captcha_config,
        cache,
        &body.captcha_id,
        &body.captcha_answer
    );

    let user = user::get_user_by_account(db, &body.account)
        .await
        .map_err(|err| {
            warn!("failed to get user by account: {:?}", err);
            match err {
                DbErr::RecordNotFound(_) => (StatusCode::FORBIDDEN, "account or password is wrong"),
                _ => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "failed to get user by account",
                ),
            }
        })?;

    match bcrypt::verify(body.password, &user.password.unwrap_or(String::new())) {
        Ok(true) => {
            *(token_tracker.token.lock().await) = Token {
                id: user.id,
                name: user.name,
                permissions: user.permissions,
                ..Default::default()
            };
            token_tracker
                .renew_requested
                .store(true, std::sync::atomic::Ordering::Relaxed);

            Ok(StatusCode::OK)
        }
        Ok(false) => Err((StatusCode::FORBIDDEN, "account or password is wrong")),
        Err(err) => {
            warn!("failed to verify password: {:?}", err);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "failed to verify password with server error",
            ))
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct RegisterRequest {
    pub name: String,
    pub email: String,
    pub password: String,
    pub captcha_id: String,
    pub captcha_answer: String,
}

async fn register(
    State(ref db): State<DatabaseConnection>,
    State(ref mut cache): State<RedisPool>,
    Extension(config): Extension<ConfigModel>,
    Json(body): Json<RegisterRequest>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    debug!("register request: {:?}", body);
    let captcha_config = &config.captcha;
    captcha_protected!(
        captcha_config,
        cache,
        &body.captcha_id,
        &body.captcha_answer
    );

    if user::get_user_by_account(db, &body.email).await.is_ok() {
        return Err((StatusCode::CONFLICT, "account already exists"));
    }

    let password = bcrypt::hash(body.password, bcrypt::DEFAULT_COST).map_err(|err| {
        warn!("failed to hash password: {:?}", err);
        (StatusCode::INTERNAL_SERVER_ERROR, "failed to hash password")
    })?;

    let permissions = match count_user(db).await.map_err(|err| {
        error!("failed to count user: {:?}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "encountered error in database",
        )
    })? {
        0 => Permissions(vec![
            Permission::Basic,
            Permission::Verified,
            Permission::Publish,
            Permission::Audit,
            Permission::Organize,
            Permission::Devops,
            Permission::Statistics,
            Permission::Calendar,
            Permission::Certificates,
        ]),
        _ => Permissions(vec![Permission::Basic]),
    };
    let new_user = user::Model {
        name: body.name,
        password: Some(password),
        email: Some(body.email),
        permissions,
        hidden: false,
        banned: false,
        ..Default::default()
    };

    Ok(Json(
        create_user(db, new_user)
            .await
            .map_err(|err| {
                error!("failed to create user: {:?}", err);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "failed to create user with database error",
                )
            })?
            .desensitize(),
    ))
}

async fn logout(
    State(ref mut cache): State<RedisPool>,
    Extension(token): Extension<Token>,
    Extension(token_tracker): Extension<TokenTracker>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    debug!("logout request");
    if token.id < 0 {
        return Err((StatusCode::FORBIDDEN, "you are not logged in"));
    }
    if let Some(token) = token_tracker.original {
        cache::Token::revoke(cache, &token).await.map_err(|err| {
            error!("failed to revoke token: {:?}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "failed to revoke token with cache error",
            )
        })?;
    }

    Ok(StatusCode::OK)
}

async fn update_self_setting(
    State(ref conn): State<DatabaseConnection>,
    Extension(op_user): Extension<user::Model>,
    Json(data): Json<user::Model>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    match user::update_self_profile(conn, op_user.id, data).await {
        Ok(user) => Ok(Json(user)),
        Err(err) => {
            error!("failed to update profile: {:?}", err);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "failed to update user with database error",
            ))
        }
    }
}

#[derive(Deserialize)]
struct ChangePasswordRequest {
    pub old_password: String,
    pub new_password: String,
    pub captcha_id: String,
    pub captcha_answer: String,
}

async fn change_password(
    State(ref conn): State<DatabaseConnection>,
    State(ref mut cache): State<RedisPool>,
    Extension(config): Extension<ConfigModel>,
    Extension(token_tracker): Extension<TokenTracker>,
    Extension(user): Extension<user::Model>,
    Json(body): Json<ChangePasswordRequest>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    let captcha_config = &config.captcha;
    captcha_protected!(
        captcha_config,
        cache,
        &body.captcha_id,
        &body.captcha_answer
    );

    match bcrypt::verify(body.old_password, &user.password.unwrap_or(String::new())) {
        Ok(true) => {}
        Ok(false) => return Err((StatusCode::FORBIDDEN, "account or password is wrong")),
        Err(err) => {
            warn!("failed to verify password: {:?}", err);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "failed to verify password with server error",
            ))
        }
    }
    let password = bcrypt::hash(body.new_password, bcrypt::DEFAULT_COST).map_err(|err| {
        warn!("failed to hash password: {:?}", err);
        (StatusCode::INTERNAL_SERVER_ERROR, "failed to hash password")
    })?;
    match user::update_user_password(conn, user.id, password).await {
        Ok(_) => {
            info!("Password changed for {}", user.name);
            if let Some(token) = token_tracker.original {
                cache::Token::revoke(cache, &token).await.map_err(|err| {
                    error!("failed to revoke token: {:?}", err);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "failed to revoke token with cache error",
                    )
                })?;
            }
            Ok(StatusCode::OK)
        },
        Err(DbErr::RecordNotFound(_)) => {
            error!("failed to update password: user {} not found", user.name);
            Err((StatusCode::NOT_FOUND, "user not found"))
        },
        Err(err) => {
            error!("failed to update password: {:?}", err);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "failed to update password with database error",
            ))
        }
    }
}
