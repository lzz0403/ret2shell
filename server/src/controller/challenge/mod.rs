use super::GlobalState;
use axum::Router;

mod answer;
mod repo;
mod submission;
mod traffic;
mod workflow;

pub fn router(_state: &GlobalState) -> Router<GlobalState> {
    Router::new()
}
