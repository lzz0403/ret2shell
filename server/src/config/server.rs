//! This module contains the configuration for a server.
use serde::{Deserialize, Serialize};

/// Represents the configuration for a server.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    /// The host address of the server.
    pub host: String,
    /// The port number on which the server is listening.
    pub port: i16,
    /// The external host address of the server.
    pub external_domain: String,
    /// Indicates whether the server uses HTTPS for external connections.
    pub external_https: bool,
    /// The base path for the server's API.
    pub api_base_path: String,
    /// CORS rules enabled
    pub cors_origins: String,
}
