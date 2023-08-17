use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "platform_info")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    #[sea_orm(column_type = "JsonBinary")]
    pub platform: Option<Json>,
    #[sea_orm(column_type = "JsonBinary")]
    pub captcha: Option<Json>,
    #[sea_orm(column_type = "JsonBinary")]
    pub email: Option<Json>,
    #[sea_orm(column_type = "JsonBinary")]
    pub media: Option<Json>,
    #[sea_orm(column_type = "JsonBinary")]
    pub pusher: Option<Json>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
