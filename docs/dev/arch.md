# Project Architecture

- src
  - audit: sensitive word audit
  - bucket: for challenge storage
  - cache
  - captcha
  - checker: for challenge checking
  - config
  - controller: Web API controller
  - entity: database ORM entities
  - logging
  - media: for media storage
  - migrator: database migration
  - oauth: third party auth
  - queue: message queue for async tasks
  - service: serves challenge container
  - traffic: the reversed proxy for challenge container
  - utility
  - workflow: the CI/CD system for challenge building
