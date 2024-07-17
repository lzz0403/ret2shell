use chrono::{DateTime, Utc};
use futures_io::AsyncBufRead;
use k8s_openapi::{
  api::core::v1::{
    ConfigMap, Container, ContainerPort, Namespace, Node, Pod, PodSpec, ResourceRequirements,
  },
  apimachinery::pkg::{api::resource::Quantity, version::Info},
};
use kube::{
  api::{ListParams, LogParams, ObjectList, ObjectMeta},
  Api, Client,
};
use r2s_config::cluster::ChallengeEnv;

use super::traits::ClusterError;

#[derive(Clone)]
pub struct Cluster {
  client: Option<Client>,
  namespace: Option<String>,
}

macro_rules! with_namespace {
  ($ns: expr, $reason: expr) => {
    $ns
      .clone()
      .ok_or(ClusterError::NeedNamespace($reason.to_owned()))
  };
}

macro_rules! check_enabled {
  ($client: expr) => {
    if let Some(c) = $client.clone() {
      Ok(c)
    } else {
      Err(super::traits::ClusterError::ClusterDisabled)
    }
  };
}

impl Cluster {
  pub fn new(client: Option<Client>) -> Self {
    Self {
      client,
      namespace: Some(String::from("default")),
    }
  }

  /// Set the namespace for the cluster
  ///
  /// Example:
  ///
  /// ```rust
  /// cluster.at("challenge").some_operations().await;
  /// ```
  pub fn at(&self, namespace: &str) -> Self {
    Self {
      namespace: Some(namespace.to_owned()),
      ..self.to_owned()
    }
  }

  pub async fn version(&self) -> Result<Info, ClusterError> {
    let client = check_enabled!(self.client)?;
    let version = client.apiserver_version().await?;
    Ok(version)
  }

  pub async fn nodes(&self) -> Result<ObjectList<Node>, ClusterError> {
    let client = check_enabled!(self.client)?;
    let api: Api<Node> = Api::all(client);
    let nodes = api.list(&ListParams::default()).await?;
    Ok(nodes)
  }

  pub async fn namespaces(&self) -> Result<ObjectList<Namespace>, ClusterError> {
    let client = check_enabled!(self.client)?;
    let api: Api<Namespace> = Api::all(client);
    let namespaces = api.list(&ListParams::default()).await?;
    Ok(namespaces)
  }

  pub async fn configs(&self) -> Result<ObjectList<ConfigMap>, ClusterError> {
    let client = check_enabled!(self.client)?;
    let api: Api<ConfigMap> = Api::all(client);
    let configs = api.list(&ListParams::default()).await?;
    Ok(configs)
  }

  pub async fn logs(
    &self, pod: String, container: Option<String>, follow: bool, tail_lines: Option<i64>,
    since_time: Option<DateTime<Utc>>,
  ) -> Result<impl AsyncBufRead, ClusterError> {
    let client = check_enabled!(self.client)?;
    let pods: Api<Pod> = Api::namespaced(client, &with_namespace!(&self.namespace, "logs")?);
    let logs = pods
      .log_stream(
        &pod,
        &LogParams {
          follow,
          container,
          tail_lines,
          since_time,
          timestamps: true,
          ..LogParams::default()
        },
      )
      .await?;
    Ok(logs)
  }

  pub async fn create_namespace(&self, name: &str) -> Result<Namespace, ClusterError> {
    let client = check_enabled!(self.client)?;
    let api: Api<Namespace> = Api::all(client);
    let namespace = Namespace {
      metadata: ObjectMeta {
        name: Some(name.to_owned()),
        ..Default::default()
      },
      ..Default::default()
    };
    let namespace = api.create(&Default::default(), &namespace).await?;
    Ok(namespace)
  }

  pub async fn create_pod(&self, pod: Pod) -> Result<Pod, ClusterError> {
    let client = check_enabled!(self.client)?;
    let api: Api<Pod> = Api::namespaced(client, &with_namespace!(&self.namespace, "create pod")?);
    let pod = api.create(&Default::default(), &pod).await?;
    Ok(pod)
  }

  pub async fn delete_pod(&self, name: &str) -> Result<(), ClusterError> {
    let client = check_enabled!(self.client)?;
    let api: Api<Pod> = Api::namespaced(client, &with_namespace!(&self.namespace, "delete pod")?);
    api.delete(name, &Default::default()).await?;
    Ok(())
  }

  pub async fn infer_pod(&self, name: &str) -> Result<Pod, ClusterError> {
    let client = check_enabled!(self.client)?;
    let api: Api<Pod> = Api::namespaced(client, &with_namespace!(&self.namespace, "infer pod")?);
    let pod = api.get(name).await?;
    Ok(pod)
  }

  pub async fn list_pods(&self) -> Result<ObjectList<Pod>, ClusterError> {
    let client = check_enabled!(self.client)?;
    let api: Api<Pod> = Api::namespaced(client, &with_namespace!(&self.namespace, "list pods")?);
    let pods = api.list(&ListParams::default()).await?;
    Ok(pods)
  }

  pub async fn list_pods_by_label(&self, label: &str) -> Result<ObjectList<Pod>, ClusterError> {
    let client = check_enabled!(self.client)?;
    let api: Api<Pod> = Api::namespaced(client, &with_namespace!(&self.namespace, "list pods")?);
    let pods = api
      .list(&ListParams {
        label_selector: Some(label.to_owned()),
        ..Default::default()
      })
      .await?;
    Ok(pods)
  }

  pub async fn create_challenge_env(
    &self, user_id: i64, team_id: Option<i64>, challenge_id: i64, challenge_name: &str,
    env_config: ChallengeEnv,
  ) -> Result<(), ClusterError> {
    let pod_name = format!(
      "ret2shell-{challenge_id}-{user_id}-{}",
      team_id.unwrap_or(0)
    );
    let pod = Pod {
      metadata: ObjectMeta {
        name: Some(pod_name.clone()),
        labels: Some(
          [
            ("ret.sh.cn/service", pod_name),
            ("ret.sh.cn/challenge", challenge_id.to_string()),
            ("ret.sh.cn/user", user_id.to_string()),
            ("ret.sh.cn/team", team_id.unwrap_or(0).to_string()),
          ]
          .iter()
          .cloned()
          .map(|(k, v)| (k.to_owned(), v.to_owned()))
          .collect(),
        ),
        annotations: Some(
          [("ret.sh.cn/challenge-name", challenge_name.to_owned())]
            .iter()
            .cloned()
            .map(|(k, v)| (k.to_owned(), v.to_owned()))
            .collect(),
        ),
        ..Default::default()
      },
      spec: Some(PodSpec {
        containers: env_config
          .images
          .iter()
          .map(|image| Container {
            name: image.name.clone(),
            image: Some(image.tag.clone()),
            ports: image.port.map(|port| {
              vec![ContainerPort {
                container_port: port as i32,
                name: Some(format!("ret2shell-traffic-{}", port)),
                protocol: Some("TCP".to_owned()),
                ..Default::default()
              }]
            }),
            resources: Some(ResourceRequirements {
              limits: Some(
                [
                  ("cpu", image.cpu.to_string()),
                  ("memory", image.mem.clone()),
                ]
                .iter()
                .cloned()
                .map(|(k, v)| (k.to_owned(), Quantity(v)))
                .collect(),
              ),
              ..Default::default()
            }),
            ..Default::default()
          })
          .collect(),
        ..Default::default()
      }),
      ..Default::default()
    };
    self.create_pod(pod).await?;
    Ok(())
  }
}
