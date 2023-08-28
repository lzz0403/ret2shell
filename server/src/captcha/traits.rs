use crate::cache::manager::RedisPool;
use serde::{Deserialize, Serialize};
use async_trait::async_trait;
use thiserror::Error;

/// Validator enum for different types of captcha validation
#[derive(Serialize, Deserialize, Default)]
pub enum Validator {
    #[default]
    Image,
    Pow,
    RecaptchaV3,
}

/// Captcha struct for storing captcha data
#[derive(Serialize, Deserialize, Default)]
pub struct Captcha {
    /// Unique identifier for the captcha
    pub id: String,
    /// Validator type for the captcha
    pub validator: Validator,
    /// Challenge string for the captcha
    pub challenge: String,
    // skip serialize answer
    #[serde(skip_serializing)]
    /// Answer string for the captcha
    pub answer: String,
}

#[derive(Debug, Error)]
pub enum CaptchaError {
    #[error("Captcha Builder error")]
    BuilderError,
    #[error("Cache error")]
    CacheError(#[from] crate::cache::manager::CacheError<redis::RedisError>),
    #[error("Uknown error")]
    Unknown,
}

/// A trait for captcha validators.
#[async_trait]
pub trait CaptchaValidator: Send + Sync {
    async fn generate_captcha(conn: &mut RedisPool) -> Result<Captcha, CaptchaError>;

    async fn check_captcha(conn: &mut RedisPool, id: &str, answer: &str) -> Result<bool, CaptchaError>;
}
