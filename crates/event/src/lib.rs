use std::{net::IpAddr, sync::Arc};

use async_nats::jetstream::consumer::pull::Stream;
use axum::extract::ws::{Message, WebSocket};
use chrono::{DateTime, Utc};
use events::EventContainer;
use tokio::sync::{broadcast, RwLock};

pub mod events;
mod worker;
pub use events::Event;
pub mod traits;
pub use traits::EventError;

#[derive(Clone, Debug)]
pub struct EventManager {
  tx: broadcast::Sender<EventContainer>,
  pub clients: Arc<RwLock<Vec<(i64, String, IpAddr, DateTime<Utc>)>>>,
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
      clients.push((id, client.clone(), ip_addr.clone(), subscribed_time.clone()));
    }

    while let Ok(event) = rx.recv().await {
      if event.game_id != id {
        continue;
      }
      let message = serde_json::to_string(&event.event).unwrap();
      ws.send(Message::Text(message)).await.ok();
    }
    {
      let mut clients = self.clients.write().await;
      clients
        .retain(|(i, c, a, d)| *i != id || *c != client || *a != ip_addr || *d != subscribed_time);
    }
  }

  pub async fn broadcast(&self, message: EventContainer) {
    self.tx.send(message).ok();
  }
}

pub async fn initialize(stream: Stream) -> EventManager {
  let manager = EventManager::new();
  let future = worker::event_pusher(stream, manager.clone());
  tokio::spawn(future);
  manager
}
