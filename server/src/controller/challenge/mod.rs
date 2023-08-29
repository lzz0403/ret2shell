use super::GlobalState;
use axum::Router;

mod answer;
mod repo;
mod submission;
mod traffic;
mod workflow;

pub fn router() -> Router<GlobalState> {
    Router::new()
}
