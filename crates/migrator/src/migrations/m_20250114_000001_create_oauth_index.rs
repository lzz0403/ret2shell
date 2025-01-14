use sea_orm_migration::prelude::*;

use super::m_20240101_000003_create_oauth::Oauth;

pub struct Migration;

impl MigrationName for Migration {
  fn name(&self) -> &str {
    "m_20250114_000001_create_oauth_index"
  }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_index(
        Index::create()
          .table(Oauth::Table)
          .col(Oauth::AuthKey)
          .col(Oauth::Provider)
          .unique()
          .to_owned(),
      )
      .await?;
    Ok(())
  }

  async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
    Ok(())
  }
}
