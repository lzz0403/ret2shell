use sea_orm_migration::prelude::*;

pub struct Migration;

impl MigrationName for Migration {
    fn name(&self) -> &str {
        "m20210101_000023_create_group"
    }
}

#[derive(Iden)]
pub enum Group {
    Table,
    Id,
    Name,
    Permissions,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Group::Table)
                    .col(
                        ColumnDef::new(Group::Id)
                            .big_integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Group::Name).string_len(127).not_null())
                    .col(ColumnDef::new(Group::Permissions).text())
                    .to_owned(),
            )
            .await
    }

    // Define how to rollback this migration: Drop the Bakery table.
    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Group::Table).to_owned())
            .await
    }
}
