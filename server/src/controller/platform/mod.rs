use axum::extract::State;
use axum::http::StatusCode;
use axum::Json;
use axum::{response::IntoResponse, routing::get, Router};
use sea_orm::DatabaseConnection;
use tracing::error;

use crate::controller::GlobalState;
use crate::entity::platform_info;

pub fn router() -> Router<GlobalState> {
    Router::new().route("/", get(get_platform_info))
}

async fn get_platform_info(
    State(ref db): State<DatabaseConnection>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    match platform_info::get_platform_info(db).await {
        Ok(Some(info)) => Ok(Json(info)),
        Ok(None) => Err((StatusCode::NOT_FOUND, "not found")),
        Err(err) => {
            error!("query platform info from database failed: {}", err);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                "encountered database error",
            ))
        }
    }
}
