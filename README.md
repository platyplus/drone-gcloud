# Drone.io CI plugin for Google Cloud

## Example

```yaml
kind: pipeline
name: default
steps:
  - name: docker
    image: platyplus/drone-gcloud
      environment:
        PROJECT_ID:
          from_secret: PROJECT_ID
      settings:
        credentials:
          from_secret: GCLOUD_CREDENTIALS
        config:
          - compute/region: europe-west1
        commands:
          - projects list
          - PROJECT_NAME: projects describe $$PROJECT_ID --format="get(name)"
          - sql instances describe $$PROJECT_NAME --format="get(connectionName)"
```
