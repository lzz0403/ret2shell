pub mod adapters;
pub mod traits;
mod utility;
use r2s_config::auth::Config;
pub use traits::OAuthError;

#[derive(Clone, Debug)]
pub struct OAuth {
  pub xdu: Option<adapters::xdu::OAuthProvider>,
  pub xmu: Option<adapters::xmu::OAuthProvider>,
  pub jiangnan: Option<adapters::jiangnan::OAuthProvider>,
  pub nwnu: Option<adapters::nwnu::OAuthProvider>,
  pub taru: Option<adapters::taru::OAuthProvider>,
}

impl OAuth {
  pub fn from_config(config: &Config) -> Self {
    OAuth {
      xdu: if let Some(key) = &config
        .oauth_keys
        .as_ref()
        .and_then(|keys| keys.xdu.as_ref())
      {
        Some(adapters::xdu::OAuthProvider {
          key: key.to_owned().clone(),
        })
      } else {
        None
      },
      xmu: if let Some(key) = &config
        .oauth_keys
        .as_ref()
        .and_then(|keys| keys.xmu.as_ref())
      {
        Some(adapters::xmu::OAuthProvider {
          key: key.to_owned().clone(),
        })
      } else {
        None
      },
      jiangnan: if let Some(key) = &config
        .oauth_keys
        .as_ref()
        .and_then(|keys| keys.jiangnan.as_ref())
      {
        Some(adapters::jiangnan::OAuthProvider {
          key: key.to_owned().clone(),
        })
      } else {
        None
      },
      nwnu: if let Some(key) = &config
        .oauth_keys
        .as_ref()
        .and_then(|keys| keys.nwnu.as_ref())
      {
        Some(adapters::nwnu::OAuthProvider {
          key: key.to_owned().clone(),
        })
      } else {
        None
      },
      taru: if let Some(key) = &config
        .oauth_keys
        .as_ref()
        .and_then(|keys| keys.taru.as_ref())
      {
        Some(adapters::taru::OAuthProvider {
          key: key.to_owned().clone(),
        })
      } else {
        None
      },
    }
  }

  pub fn get_provider(&self, provider: &str) -> Option<&dyn traits::OAuthProvider> {
    match provider {
      "xdu" => self
        .xdu
        .as_ref()
        .map(|xdu| xdu as &dyn traits::OAuthProvider),
      "xmu" => self
        .xmu
        .as_ref()
        .map(|xmu| xmu as &dyn traits::OAuthProvider),
      "jiangnan" => self
        .jiangnan
        .as_ref()
        .map(|jiangnan| jiangnan as &dyn traits::OAuthProvider),
      "nwnu" => self
        .nwnu
        .as_ref()
        .map(|nwnu| nwnu as &dyn traits::OAuthProvider),
      "taru" => self
        .taru
        .as_ref()
        .map(|taru| taru as &dyn traits::OAuthProvider),
      _ => None,
    }
  }
}

pub async fn initialize(config: &Option<Config>) -> OAuth {
  if let Some(config) = config {
    OAuth::from_config(config)
  } else {
    OAuth {
      xdu: None,
      xmu: None,
      jiangnan: None,
      nwnu: None,
      taru: None,
    }
  }
}
