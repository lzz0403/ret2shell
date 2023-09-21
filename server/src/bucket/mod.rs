//! The bucket system, which is used to store the files and serve `wsvc` service.
//!
//!

use std::path::{Path, PathBuf};

use thiserror::Error;
use tokio::{fs::create_dir_all, io};
use wsvc::{
    fs::RepoGuard,
    model::{ObjectId, Record, Repository},
};

use crate::entity::challenge::Model as ChallengeModel;

#[derive(Error, Debug)]
pub enum BucketError {
    #[error("challenge must have a bucket: {0:?}")]
    LackOfBucketId(ChallengeModel),
    #[error("bucket init conflict: {0}")]
    BucketInitConflict(String),
    #[error("io error: {0}")]
    IoError(#[from] io::Error),
    #[error("wsvc general error: {0}")]
    WsvcError(#[from] wsvc::WsvcError),
    #[error("wsvc fs error: {0}")]
    WsvcFsError(#[from] wsvc::fs::WsvcFsError),
    #[error("repository is empty: {0}")]
    RepositoryIsEmpty(String),
}

pub struct Bucket {
    storage_root_dir: PathBuf,
    pub challenge: ChallengeModel,
}

impl Bucket {
    fn new(storage_root_dir: impl AsRef<Path>, challenge: &ChallengeModel) -> Self {
        Self {
            storage_root_dir: storage_root_dir.as_ref().to_owned(),
            challenge: challenge.clone(),
        }
    }

    pub async fn initialize(
        storage_root_dir: impl AsRef<Path>,
        challenge: &ChallengeModel,
    ) -> Result<Self, BucketError> {
        let bucket_dir = storage_root_dir.as_ref().join(
            &challenge
                .bucket
                .as_ref()
                .ok_or(BucketError::LackOfBucketId(challenge.clone()))?,
        );
        if bucket_dir.exists() {
            return Err(BucketError::BucketInitConflict(
                bucket_dir.to_string_lossy().to_string(),
            ));
        }
        let repo_dir = bucket_dir.join("repo");
        create_dir_all(&repo_dir).await?;
        let _ = Repository::new(repo_dir, false).await?;
        create_dir_all(bucket_dir.join("workflows")).await?;
        create_dir_all(bucket_dir.join("static")).await?;

        Ok(Self::new(storage_root_dir, challenge))
    }

    async fn repo_dir(&self) -> Result<PathBuf, BucketError> {
        let bucket_dir = self
            .storage_root_dir
            .join(
                &self
                    .challenge
                    .bucket
                    .as_ref()
                    .ok_or(BucketError::LackOfBucketId(self.challenge.clone()))?,
            )
            .join("repo");
        if !bucket_dir.exists() {
            return Err(BucketError::BucketInitConflict(
                bucket_dir.to_string_lossy().to_string(),
            ));
        }
        Ok(bucket_dir)
    }

    pub async fn repo(&self) -> Result<Repository, BucketError> {
        let repo_dir = self.repo_dir().await?;
        Ok(Repository::open(repo_dir, false).await?)
    }

    pub async fn workflows_dir(&self) -> Result<PathBuf, BucketError> {
        let bucket_dir = self
            .storage_root_dir
            .join(
                &self
                    .challenge
                    .bucket
                    .as_ref()
                    .ok_or(BucketError::LackOfBucketId(self.challenge.clone()))?,
            )
            .join("workflows");
        if !bucket_dir.exists() {
            return Err(BucketError::BucketInitConflict(
                bucket_dir.to_string_lossy().to_string(),
            ));
        }
        Ok(bucket_dir)
    }

    pub async fn static_dir(&self) -> Result<PathBuf, BucketError> {
        let bucket_dir = self
            .storage_root_dir
            .join(
                &self
                    .challenge
                    .bucket
                    .as_ref()
                    .ok_or(BucketError::LackOfBucketId(self.challenge.clone()))?,
            )
            .join("static");
        if !bucket_dir.exists() {
            return Err(BucketError::BucketInitConflict(
                bucket_dir.to_string_lossy().to_string(),
            ));
        }
        Ok(bucket_dir)
    }

    pub async fn checkout_latest(&self) -> Result<(), BucketError> {
        let repo = self.repo().await?;
        let guard = RepoGuard::new(&repo).await?;
        repo.checkout_record(
            &repo
                .get_latest_record()
                .await?
                .ok_or(BucketError::RepositoryIsEmpty(
                    self.challenge.bucket.clone().unwrap_or_default(),
                ))?
                .hash,
            &self.repo_dir().await?,
        )
        .await?;
        drop(guard);
        Ok(())
    }

    pub async fn checkout_record(&self, hash: &ObjectId) -> Result<(), BucketError> {
        let repo = self.repo().await?;
        repo.checkout_record(hash, &self.repo_dir().await?).await?;
        Ok(())
    }

    pub async fn commit_record(
        &self,
        author: impl AsRef<str>,
        message: impl AsRef<str>,
    ) -> Result<Record, BucketError> {
        let repo = self.repo().await?;
        Ok(repo
            .commit_record(&self.repo_dir().await?, author, message)
            .await?)
    }

    pub async fn get_records(&self) -> Result<Vec<Record>, BucketError> {
        let repo = self.repo().await?;
        Ok(repo.get_records().await?)
    }
}
