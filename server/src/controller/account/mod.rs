mod captcha;

use axum::Router;

use crate::controller::GlobalState;

pub fn router(state: &GlobalState) -> Router<GlobalState> {
    Router::new().nest("/captcha", captcha::router(state))
}
