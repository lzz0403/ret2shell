use sea_orm_migration::prelude::*;
use sea_query::Keyword::CurrentTimestamp;

use super::{m20210101_000002_create_user::User, m20210101_000004_create_game::Game};

pub struct Migration;

impl MigrationName for Migration {
    fn name(&self) -> &str {
        "m_20210101_000020_create_ctftime"
    }
}

#[derive(Iden)]
pub enum Ctftime {
    Table,
    Id,
    GameId,
    ReporterId,
    Name,
    Intro,
    Link,
    StartTime,
    EndTime,
    Audited,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Ctftime::Table)
                    .col(
                        ColumnDef::new(Ctftime::Id)
                            .big_integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Ctftime::Name).string_len(63).not_null())
                    .col(ColumnDef::new(Ctftime::Intro).text().not_null())
                    .col(ColumnDef::new(Ctftime::Link).string_len(511).not_null())
                    .col(
                        ColumnDef::new(Ctftime::StartTime)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(CurrentTimestamp),
                    )
                    .col(
                        ColumnDef::new(Ctftime::EndTime)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(CurrentTimestamp),
                    )
                    .col(
                        ColumnDef::new(Ctftime::Audited)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .col(ColumnDef::new(Ctftime::GameId).big_integer())
                    .foreign_key(
                        ForeignKey::create()
                            .name("ctftime_game_id_fkey")
                            .from(Ctftime::Table, Ctftime::GameId)
                            .to(Game::Table, Game::Id),
                    )
                    .col(ColumnDef::new(Ctftime::ReporterId).big_integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("ctftime_reporter_id_fkey")
                            .from(Ctftime::Table, Ctftime::ReporterId)
                            .to(User::Table, User::Id),
                    )
                    .to_owned(),
            )
            .await
    }

    // Define how to rollback this migration: Drop the Bakery table.
    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Ctftime::Table).to_owned())
            .await
    }
}
