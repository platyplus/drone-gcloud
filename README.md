# Drone.io CI plugin for Google Cloud

## Usage

```yaml
kind: pipeline
name: default
steps:
  - name: docker
    image: platyplus/drone-gcloud
    settings:
      credentials: <base64-encoded GCloud JSON credentials>
      config:
        <gcloud-config-key>: <gcloud-config-value>
      commands:
        - <gcloud command without the 'gcloud' prefix>
        - <EXPORTED_ENV_VAR>: <gcloud command without the 'gcloud' prefix>
        - command: <gcloud command without the 'gcloud' prefix>
          export: <EXPORTED_ENV_VAR>
          skipError: false # true will allow to go one with the next commands and steps if the current command raises an error
          flags:
            - <flag-name>: <flag-value> # becomes: --<flagname> <flag-value>
            - <flag-name> # becomes: --<flag-name>
            - <flag-name>: # becomes: --<flag-bame> <param1>=<value1>,<param2>=<value2>
                <param-1>: <value1>
                <param-2>: <value2>
```

## Credentials (required)

The credentials parameter is a Google Cloud JSON key that has been encoded in Base64. See the [official documentation](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-service-account-keys-list-gcloud) to know how to generate the JSON file.

Once the JSON file is generated, don't forget to encode it in Base64, for instance in running `base64 key.json`.

The `project` config will be automatically set based on the `project_id` attribute found in the credentials.

It is **strongly** recommended not to use the credentials directly in your `.drone.yml` file, but to store it as a secret. As an example:

```yaml
###
steps:
  - name: docker
    image: platyplus/drone-gcloud
    settings:
      credentials:
        from_secret: <your-secret-name>
###
```

## Configuration (optional)

Google Cloud often require to set a specific configuration through `gcloud config set`. It is possible to set such configuration through the `config` setting, for instance:

```yaml
###
steps:
  - name: docker
    image: platyplus/drone-gcloud
    settings:
      config:
        project: <project-id>
        compute/region: europe-west1
###
```

The `config` setting can either be an array or an object like the above example.

## Commands

The `commands` setting is an array of commands that will be executed once the authentication and configuration steps succeeded.

A command is a gcloud command without the `gcloud` prefix. For instance, the `gcloud projects list` command line will become `projects list` in the YAML file.

> Note that an empty `commands` setting won't raise an error

A command can be written in different formats:

### String

The simplest way to run `gcloud <command>`:

```yaml
###
steps:
  - ###
    settings:
      commands:
        - <command>
###
```

### Key/value pair

The result of `gcloud <command>` can be exported into the `<destination>` environment variable, so it can be used in further commands:

```yaml
###
steps:
  - ###
    settings:
      commands:
        - <destination>: <command>
###
```

### Object

This way of defining a command offers some options:

```yaml
###
steps:
  - ###
    settings:
      commands:
        - command: (string), the command in itself, e.g. projects list
          export: (string, optional) environment variable in which the command's result will be stored
          skipError: (boolean, default=false) continue running the commands' list even if this command fails.
          flags: (array, optional) list of flags to append to a command. The 'flags' format is explained next.
###
```

### Flags

Command flags are defined in an array of different possible values:

## Example

```yaml
kind: pipeline
name: default
steps:
  - name: test
    image: platyplus/drone-gcloud:${DRONE_COMMIT}
    environment:
      PROJECT_ID:
        from_secret: project_id
    settings:
      credentials:
        from_secret: google_credentials
      config:
        project: $$PROJECT_ID
        compute/region: europe-west1
        compute/zone: europe-west1-a
      commands:
        - projects list
        - command: an incorrect command
          skipError: true
        - command: projects describe $$PROJECT_ID
          export: PROJECT_NAME
          flags:
            - format: '"get(name)"'
            - quiet
        - command: sql instances describe $$PROJECT_NAME
          flags:
            - format: '"get(connectionName)"'
```

## Contribute

I developped this module for answer to the requirements of the [platyplus project](https://github.com/platyplus/platyplus). Some features may be missing, and some bugs may need to be fixed. Feel free to open an issue or create a pull request!
