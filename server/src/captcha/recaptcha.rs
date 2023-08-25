use async_trait::async_trait;

use crate::cache::manager::RedisPool;

use super::traits::{CaptchaValidator, CaptchaError, Captcha};
pub struct ReCaptchaV3Validator;

#[async_trait]
impl CaptchaValidator for ReCaptchaV3Validator {
    async fn generate_captcha(conn: &mut RedisPool) -> Result<Captcha, CaptchaError> {
        Err(CaptchaError::Unknown)
    }

    async fn check_captcha(
        conn: &mut RedisPool,
        id: &str,
        answer: &str,
    ) -> Result<bool, CaptchaError> {
        Err(CaptchaError::Unknown)
    }
}
