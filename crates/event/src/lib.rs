use std::{net::IpAddr, sync::Arc};

use async_nats::jetstream::consumer::pull::Stream;
use axum::extract::ws::{Message, WebSocket};
use chrono::{DateTime, Utc};
use events::{Broadcast, EventContainer};
use tokio::sync::{broadcast, RwLock};

pub mod events;
mod worker;
pub use events::Event;
pub mod traits;
use tracing::{info, warn};
pub use traits::EventError;

type EventClient = (i64, String, IpAddr, DateTime<Utc>);

#[derive(Clone, Debug)]
pub struct EventManager {
  tx: broadcast::Sender<Broadcast>,
  pub clients: Arc<RwLock<Vec<EventClient>>>,
}

impl Default for EventManager {
  fn default() -> Self {
    Self::new()
  }
}

impl EventManager {
  pub fn new() -> Self {
    let (tx, _) = broadcast::channel(128);
    Self {
      tx,
      clients: Arc::new(RwLock::new(Vec::new())),
    }
  }

  pub async fn subscribe(&self, id: i64, ip_addr: IpAddr, client: String, mut ws: WebSocket) {
    let mut rx = self.tx.subscribe();
    let subscribed_time = Utc::now();
    {
      let mut clients = self.clients.write().await;
      clients.push((id, client.clone(), ip_addr, subscribed_time));
    }

    while let Ok(event) = rx.recv().await {
      match event {
        Broadcast::Publish(event) => {
          if event.game_id != id {
            continue;
          }
          let message = match serde_json::to_string(&event.event).ok() {
            Some(message) => message,
            None => continue,
          };
          match ws.send(Message::Text(message)).await {
            Ok(_) => {}
            Err(err) => {
              warn!("Failed to send message to client: {:?}", err);
              break;
            }
          }
        }
        Broadcast::Heartbeat => match ws.send(Message::Ping(vec![])).await {
          Ok(_) => {}
          Err(err) => {
            warn!("Failed to send heartbeat to client: {:?}", err);
            break;
          }
        },
      }
    }
    {
      let mut clients = self.clients.write().await;
      info!("Client disconnected: {id}:{client}#{ip_addr}");
      clients
        .retain(|(i, c, a, d)| *i != id || *c != client || *a != ip_addr || *d != subscribed_time);
    }
  }

  pub async fn broadcast(&self, message: EventContainer) {
    self.tx.send(Broadcast::Publish(message)).ok();
  }

  pub async fn heartbeat(&self) {
    loop {
      self.tx.send(Broadcast::Heartbeat).ok();
      tokio::time::sleep(std::time::Duration::from_secs(10)).await;
    }
  }
}

pub async fn initialize(stream: Stream) -> EventManager {
  let manager = EventManager::new();
  let future = worker::event_pusher(stream, manager.clone());
  tokio::spawn(future);
  let heartbeater = manager.clone();
  tokio::spawn(async move { heartbeater.heartbeat().await });
  manager
}
