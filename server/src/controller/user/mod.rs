mod institute;

use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use sea_orm::{DatabaseConnection, DbErr};
use tracing::error;

use crate::{controller::GlobalState, entity::user::get_user};

pub fn router(_state: &GlobalState) -> Router<GlobalState> {
    Router::new().route("/:id", get(get_user_info))
}

async fn get_user_info(
    State(ref conn): State<DatabaseConnection>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    Ok(Json(get_user(conn, id).await.map_err(|err| {
        error!("Failed to get user info: {}", err);
        match err {
            DbErr::RecordNotFound(_) => return (StatusCode::NOT_FOUND, "user not found"),
            _ => (StatusCode::INTERNAL_SERVER_ERROR, "failed to get user info"),
        }
    })?.desensitize()))
}
