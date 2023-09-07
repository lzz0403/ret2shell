use axum::{
    extract::State,
    http::{Request, StatusCode},
    middleware::Next,
    response::IntoResponse,
};
use sea_orm::DatabaseConnection;

use crate::cache::{manager::RedisPool, platform::Platform};

pub async fn prepare_platform_info<B>(
    State(ref db): State<DatabaseConnection>,
    State(ref mut pool): State<RedisPool>,
    mut req: Request<B>,
    next: Next<B>,
) -> Result<impl IntoResponse, (StatusCode, &'static str)> {
    match Platform::get(pool, db).await {
        Ok(platform_info) => {
            req.extensions_mut().insert(platform_info);
        }
        Err(err) => {
            tracing::error!("failed to get platform info: {}", err);
        }
    };
    Ok(next.run(req).await)
}
