use tracing::debug;

use crate::traits::OAuthError;

use super::xml::{get_info_from_xml, IdsInfo};

pub async fn get_user_info_by_ticket(
  cas_addr: impl AsRef<str>, host_addr: impl AsRef<str>, ticket: impl AsRef<str>,
) -> Result<IdsInfo, OAuthError> {
  let url = format!(
    "{}?service={}&ticket={}",
    cas_addr.as_ref(),
    host_addr.as_ref(),
    ticket.as_ref()
  );
  debug!("CAS request: {}", url);
  let resp_body = reqwest::get(url).await?.text().await?;
  debug!("CAS response: {}", resp_body);
  get_info_from_xml(resp_body)
}
