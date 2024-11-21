use sea_orm_migration::prelude::*;

use super::m_20240104_000004_create_challenge::Challenge;
pub struct Migration;

impl MigrationName for Migration {
  fn name(&self) -> &str {
    "m_20241122_000002_challenge_timeline"
  }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .alter_table(
        Table::alter()
          .table(Challenge::Table)
          .add_column_if_not_exists(ColumnDef::new(Challenge::ReleaseAt).timestamp_with_time_zone())
          .add_column_if_not_exists(ColumnDef::new(Challenge::ArchiveAt).timestamp_with_time_zone())
          .to_owned(),
      )
      .await?;
    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .alter_table(
        Table::alter()
          .table(Challenge::Table)
          .drop_column(Challenge::ArchiveAt)
          .drop_column(Challenge::ReleaseAt)
          .to_owned(),
      )
      .await?;
    Ok(())
  }
}
