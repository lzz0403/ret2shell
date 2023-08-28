mod captcha;

use axum::Router;

use crate::controller::GlobalState;

pub fn router() -> Router<GlobalState> {
    Router::new().nest("/captcha", captcha::router())
}
