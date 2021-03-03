import * as pulumi from '@pulumi/pulumi';

export type CloudFunctionArgs = {
  /**
   * Optional: The amount memory to assign to the function
   */
  availableMemory?: pulumi.Input<number>;
  /**
   * Optional: The name of the function to call when the cloud function is invoked
   */
  entryPoint?: pulumi.Input<string>;
  /**
   * Optional: Additional environment variables to add to the cloud function
   */
  environmentVariables?: pulumi.Input<{ [key: string]: any }>;
  /**
   * Optional: Additional labels to add to the cloud function
   */
  labels?: pulumi.Input<{ [key: string]: any }>;
  /**
   * Required: Common name for resources including the resulting cloud function
   */
  name: pulumi.Input<string>;
  /**
   * Optional: The region where resources will be deployed
   */
  region?: pulumi.Input<string>;
  /**
   * Optional: Whether to re run the cloud function after it has failed
   */
  retry_on_failure?: pulumi.Input<boolean>;
  /**
   * Optional: The cloud function runtime. See: https://cloud.google.com/functions/docs/concepts/exec#runtimes
   */
  runtime?: pulumi.Input<string>;
  /**
   * Optional: The email of the service account to run the cloud function as
   */
  service_account_email?: pulumi.Input<string>;
  /**
   * Optional: The Slack channel to send alerts to
   */
  slack_channel?: pulumi.Input<string>;
  /**
   * Optional: Slack token for authenticating with Slack for alerting
   */
  slack_token?: pulumi.Input<string>;
  /**
   * Required: The path of the directory that contains your source code
   */
  source_directory: string;
  /**
   * Optional: The time in seconds that should elapse before considering the function timed out
   */
  timeout?: pulumi.Input<number>;
  /**
   * Optional: The Id of the topic or bucket resource that will trigger the cloud function
   */
  trigger_event_resource?: pulumi.Input<string>;
  /**
   * Optional: The topic or bucket resource to trigger the cloud function. See: https://cloud.google.com/functions/docs/calling/
   */
  trigger_event_type?: pulumi.Input<string>;
  /**
   * Optional: Whether or not to invoke this function with an http trigger. Cannot be used with trigger_event_resource and/or trigger_event_type
   */
  trigger_http?: pulumi.Input<boolean>;
};

export enum Variables {
  entryPoint = 'main',
  runtime = 'python38',
  location = 'europe-west2',
}
