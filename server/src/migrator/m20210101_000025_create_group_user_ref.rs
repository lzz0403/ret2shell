use sea_orm_migration::prelude::*;

use super::{m20210101_000002_create_user::User, m20210101_000023_create_group::Group};

pub struct Migration;

impl MigrationName for Migration {
    fn name(&self) -> &str {
        "m_20210101_000025_create_group_user_ref"
    }
}

#[derive(Iden)]
pub enum User2Group {
    Table,
    Id,
    UserId,
    GroupId,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(User2Group::Table)
                    .col(
                        ColumnDef::new(User2Group::Id)
                            .big_integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(User2Group::UserId).big_integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("user_2_group_user_id_fkey")
                            .from(User2Group::Table, User2Group::UserId)
                            .to(User::Table, User::Id),
                    )
                    .col(ColumnDef::new(User2Group::GroupId).big_integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("user_2_group_group_id_fkey")
                            .from(User2Group::Table, User2Group::GroupId)
                            .to(Group::Table, Group::Id),
                    )
                    .to_owned(),
            )
            .await
    }

    // Define how to rollback this migration: Drop the Bakery table.
    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(User2Group::Table).to_owned())
            .await
    }
}
