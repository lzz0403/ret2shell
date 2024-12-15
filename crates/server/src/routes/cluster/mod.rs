use axum::{
  extract::State, middleware, response::IntoResponse, routing::get, Extension, Json, Router,
};
use r2s_cache::Cache;
use r2s_cluster::Cluster;
use r2s_database::user::Permission;
use r2s_event::{
  events::{DevopsEvent, DevopsEventType, EventContainer},
  Event,
};
use r2s_queue::Queue;
use tracing::{debug, error, info, warn};

use crate::{
  middleware::auth::{self, Token},
  traits::{GlobalState, ResponseError},
};

pub fn router(state: &GlobalState) -> Router<GlobalState> {
  if state.config.cluster.as_ref().is_some_and(|c| c.enabled) {
    let cluster = state.cluster.clone();
    let queue = state.queue.clone();
    tokio::spawn(cluster_maintain_worker(state.clone(), cluster, queue));
  }
  Router::new()
    .nest(
      "/",
      Router::new()
        .route("/config", get(get_cluster_config))
        .route("/node", get(get_cluster_nodes))
        .route_layer(middleware::from_fn(auth::permission_required_all!(
          Permission::DevOps
        ))),
    )
    .route("/calmdown", get(get_calmdown_status))
    .route_layer(middleware::from_fn(auth::permission_required_all!(
      Permission::Basic,
      Permission::Verified
    )))
}

async fn cluster_maintain_worker(state: GlobalState, cluster: Cluster, queue: Queue) {
  let mut overloaded = false;
  loop {
    tokio::time::sleep(std::time::Duration::from_secs(
      state
        .config
        .cluster
        .clone()
        .unwrap_or_default()
        .cleanup_interval
        .unwrap_or(60),
    ))
    .await;
    debug!("Checking outdated pods...");
    match cluster
      .at("ret2shell-challenge")
      .delete_outdated_pods()
      .await
    {
      Ok((o, running, pending)) => {
        if o {
          warn!(
            "Cluster is overloaded: running={}, pending={}",
            running, pending
          );
          let event = EventContainer {
            game_id: 0,
            event: Event::Devops(DevopsEvent {
              event_type: DevopsEventType::ClusterOverloaded,
              running: running as i64,
              pending: pending as i64,
            }),
          };
          queue.publish("event", event).await.ok();
        } else if !o && overloaded != o {
          info!("Cluster is recovered");
          let event = EventContainer {
            game_id: 0,
            event: Event::Devops(DevopsEvent {
              event_type: DevopsEventType::ClusterRecovered,
              running: running as i64,
              pending: pending as i64,
            }),
          };
          queue.publish("event", event).await.ok();
        }
        overloaded = o;
      }
      Err(err) => error!("Failed to delete outdated pods: {:?}", err),
    }
  }
}

async fn get_cluster_config(
  State(ref cluster): State<Cluster>,
) -> Result<impl IntoResponse, ResponseError> {
  let configs = cluster.configs().await?;
  Ok(Json(configs))
}

async fn get_cluster_nodes(
  State(ref cluster): State<Cluster>,
) -> Result<impl IntoResponse, ResponseError> {
  let nodes = cluster.nodes().await?;
  Ok(Json(nodes))
}
async fn get_calmdown_status(
  State(cache): State<Cache>, Extension(token): Extension<Token>,
) -> Result<impl IntoResponse, ResponseError> {
  let timestamp = cache.at("cluster").get::<i64>(token.id).await?;
  Ok(Json(timestamp))
}
