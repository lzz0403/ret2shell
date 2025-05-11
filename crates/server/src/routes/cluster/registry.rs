use axum::{Router, body::Body};
use hyper_util::client::legacy::connect::HttpConnector;

use crate::traits::GlobalState;

type HTTPClient = hyper_util::client::legacy::Client<HttpConnector, Body>;

pub fn router(_state: &GlobalState) -> Router<GlobalState> {
  Router::new()
}
