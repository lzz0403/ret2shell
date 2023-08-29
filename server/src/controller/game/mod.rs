mod notification;
mod writeup;

use axum::Router;

use crate::controller::GlobalState;

pub fn router() -> Router<GlobalState> {
    Router::new()
}
