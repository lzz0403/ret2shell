//! NATS message queue configuration
use serde::{Deserialize, Serialize};

/// Represents the configuration for a NATS message queue.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueConfig {
    /// The hostname or IP address of the NATS server.
    pub host: String,
    /// The port number on which the NATS server is listening, default to 4222.
    pub port: Option<u16>,
    /// The optional token for authentication with the NATS server.
    pub token: Option<String>,
    /// The ping interval in seconds.
    pub ping_interval: Option<u64>,
    /// Indicates whether to use TLS for secure communication with the NATS server.
    pub tls: Option<bool>,
}
