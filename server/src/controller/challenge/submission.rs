use crate::{
    controller::{
        layer::{auth, info},
        GlobalState,
    },
    entity::{challenge, submission, user::Permission},
};
use axum::{
    extract::{Query, State},
    middleware,
    response::IntoResponse,
    routing::get,
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
        // .route("/", post(submit_flag))
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
    pub submissions: Vec<submission::ModelWithUserAndChallengeInfo>,
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
