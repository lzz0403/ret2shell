use crate::controller::GlobalState;
use axum::Router;

/*
 * Repo router
 *
 * user does not have any permissions, so this router if fully under admin layer.
 *
 * - repo entrypoint for wsvc sync tool (?)
 * - web file list
 * - web file content
 * - web record list
 * - web checkout
 * - web upload file and record
 */
pub fn router(_state: &GlobalState) -> Router<GlobalState> {
    Router::new()
}
