# pulumi-ts-cloud-function-module
Provision a GCP Cloud Function

## Requirements
[Google Cloud SDK]: https://cloud.google.com/sdk/docs/quickstarts
* [Google Cloud SDK]
* [pulumi](https://www.pulumi.com/docs/get-started/install/#install-pulumi)
* [nvm](https://github.com/nvm-sh/nvm)
* [yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)


## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| available\_memory | Optional: The amount memory to assign to the function | `number` | `128` | no |
| entry\_point | Optional: The name of the function to call when the cloud function is invoked | `string` | `"main"` | no |
| environment\_variables | Optional: Additional environment variables to add to the cloud function | `map(string)` | `{}` | no |
| labels | Optional: Additional labels to add to the cloud function | `map(string)` | `{}` | no |
| name | Required: Common name for resources including the resulting cloud function | `string` | n/a | yes |
| region | Optional: The region where resources will be deployed | `string` | `"europe-west2"` | no |
| retry\_on\_failure | Optional: Whether to re run the cloud function after it has failed | `bool` | `false` | no |
| runtime | Optional: The cloud function runtime. See: https://cloud.google.com/functions/docs/concepts/exec#runtimes | `string` | `"python38"` | no |
| service\_account\_email | Optional: The email of the service account to run the cloud function as | `string` | `${projectName}@appspot.gserviceaccount.com` | no |
| slack\_channel | Optional: The Slack channel to send alerts to. | `string` | `""` | no |
| slack\_token | Optional: Slack token for authenticating with Slack for alerting | `string` | `""` | no |
| source\_directory | Required: The path of the directory that contains your source code | `string` | n/a | yes |
| timeout | Optional: The time in seconds that should elapse before considering the function timed out | `number` | `30` | no |
| trigger\_event\_resource | Optional: The Id of the topic or bucket resource that will trigger the cloud function | `string` | `source_bucket.id` | no |
| trigger\_event\_type | Optional: The topic or bucket resource to trigger the cloud function. See: https://cloud.google.com/functions/docs/calling/ | `string` | `google.storage.object.finalize` | no |
| trigger\_http | Optional: Whether or not to invoke this function with an http trigger. Cannot be used with trigger_event_resource and/or trigger_event_type | `boolean` | `undefined` | no |

## Outputs

| Name |
|------|
| function\_environment\_variables |
| function\_service\_account |
| source\_bucket\_url |


## Usage

1. Authenticate using the [Google Cloud SDK]

2. Within your chosen directory run `pulumi new gcp-typescript` and follow the instructions

3. Initialise your state bucket by running `pulumi login --cloud-url gs://<STATE BUCKET NAME>/<PROJECT NAME>`

4. Once you have finished writing your resources (__see example below__) run `pulumi preview`

5. If you are happy with the plan output, run `pulumi up` or `pulumi up --yes`

__Debug__

```shell
pulumi up --logtostderr -v=9 2> out.txt
```

### Examples

__Simple Go http function__

```typescript
const goFunc = new CloudFunction('go_function', {
  name: 'go-func',
  source_directory: './gofunc',
  runtime: 'go113',
  trigger_http: true,
});
```

__Simple python function__

```typescript
const pyFunc = new CloudFunction('py_function', {
  name: 'py-func',
  source_directory: './pyfunc',
});
```

__Nodejs function triggered by a pubsub topic__

```typescript
const pyFunc = new CloudFunction('node_function', {
  name: 'node-func',
  source_directory: './nodefunc',
  entryPoint: 'handler',
  retry_on_failure: true,
  service_account_email: 'data-service-account@data-project.gserviceaccount.com',
  trigger_event_resource: my_pubsub.id,
  trigger_event_type: 'google.pubsub.topic.publish'
});
```

__Go function with monitoring and slack notifications__

```typescript
const goFunc = new CloudFunction('go_function', {
  name: 'go-func',
  source_directory: './gofunc',
  runtime: 'go113',
  available_memory: 256,
  entryPoint: 'Handler',
  service_account_email: 'data-service-account@data-project.gserviceaccount.com',
  trigger_event_resource: bucket.id,
  slack_token: 'N3ItiznXKZOq9ga2pF8B35270gYzspQL8u/Wt2nBrrCHyOeXnk/VyP+f44zDqneMXPMKt31aBrpWUf9yt1497w==',
  slack_channel: 'dsc-data-monitoring',

  environment_variables: {
    DATASET: 'bigquery-dataset',
    OUTPUT_DATA_BUCKET: 'my-bucket-for-output-data'
  }
});
```
