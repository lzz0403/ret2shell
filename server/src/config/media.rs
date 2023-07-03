/// Configuration for media settings.
use serde::{Deserialize, Serialize};

/// `MediaConfig` is a configuration struct for managing media settings.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaConfig {
    /// `path` is the directory where media files are stored.
    pub path: String,
    /// `limit` is the maximum allowed size (in bytes) for media files.
    pub limit: i64,
}
