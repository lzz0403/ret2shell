use crate::{
    controller::{
        layer::{auth, info},
        GlobalState,
    },
    entity::{
        challenge, game, submission,
        user::{self, Permission},
    },
};
use axum::{
    extract::{Query, State},
    middleware,
    response::IntoResponse,
    routing::{get, post},
    Extension, Json, Router,
};
use hyper::StatusCode;
use sea_orm::DatabaseConnection;
use serde::{Deserialize, Serialize};
use tracing::error;

pub fn router(_state: &GlobalState) -> Router<GlobalState> {
    Router::new()
        .route("/", get(get_challenge_submission_list))
        .route_layer(middleware::from_fn(auth::permission_required_any!(
            Permission::Organize,
            Permission::Devops,
            Permission::Audit
        )))
        .route("/", post(submit_flag))
        .route_layer(middleware::from_fn_with_state(
            _state.clone(),
            info::prepare_challenge_info,
        ))
        .route_layer(middleware::from_fn_with_state(
            _state.clone(),
            info::prepare_user_full_info,
        ))
        .route_layer(middleware::from_fn(auth::permission_required_all!(
            Permission::Verified
        )))
}

#[derive(Deserialize)]
struct ListParams {
    pub page: Option<u64>,
    pub per_page: Option<u64>,
}

#[derive(Serialize, Deserialize)]
struct SubmissionList {
    pub submissions: Vec<submission::ModelWithInfo>,
    pub total: u64,
}

async fn get_challenge_submission_list(
    State(ref conn): State<DatabaseConnection>,
    Extension(challenge): Extension<challenge::Model>,
    Query(params): Query<ListParams>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    let page = params.page.unwrap_or(1);
    let per_page = params.per_page.unwrap_or(10);
    match submission::get_submission_page(conn, Some(challenge.id), None, page, per_page).await {
        Ok((submissions, total)) => Ok(Json(SubmissionList { submissions, total })),
        Err(err) => {
            error!("Failed to get submission list: {}", err);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "failed to get submission list",
            ))
        }
    }
}

async fn submit_flag(
    State(ref conn): State<DatabaseConnection>,
    Extension(user): Extension<user::Model>,
    Extension(challenge): Extension<challenge::Model>,
    Json(mut submission): Json<submission::Model>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    // TODO: impl checker
    let result = true;

    if user.permissions.0.iter().all(|p| {
        matches!(
            p,
            Permission::Audit | Permission::Devops | Permission::Organize
        )
    }) {
        return Ok(Json(result));
    }

    let game = game::get_game(conn, challenge.game_id)
        .await
        .map_err(|err| {
            error!("get_game error: {}", err);
            (StatusCode::INTERNAL_SERVER_ERROR, "failed to get game")
        })?
        .ok_or((StatusCode::NOT_FOUND, "game not found"))?;
    submission.solved = result;
    submission.challenge_id = challenge.id;
    submission.user_id = user.id;
    submission.with_score = game.host_as_game && game.in_progress() && result;
    if let Err(err) = submission::create_submission(conn, submission).await {
        error!("create_submission error: {}", err);
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            "failed to create submission",
        ));
    }

    // TODO check and refresh team score & history for scoreboard
    // TODO push event to all connected clients

    Ok(Json(result))
}
