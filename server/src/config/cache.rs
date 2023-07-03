//! Cache server configuration.
use serde::{Deserialize, Serialize};

/// Represents the configuration for a cache.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheConfig {
    /// The hostname or IP address of the cache server.
    pub host: String,
    /// The port number on which the cache server is listening.
    pub port: Option<u16>,
    /// The optional username for authentication with the cache server.
    pub username: Option<String>,
    /// The optional password for authentication with the cache server.
    pub password: Option<String>,
    /// Indicates whether to use TLS for secure communication with the cache server.
    pub tls: Option<bool>,
}
