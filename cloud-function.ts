import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { CloudFunctionArgs, Variables } from './variables';
import { OperationalSlackAlert } from './alerting';

import * as SparkMD5 from 'spark-md5';

export class CloudFunction extends pulumi.ComponentResource {
  readonly functionEnvironmentVariables: pulumi.Output<{ [p: string]: any } | undefined> | undefined;
  readonly functionServiceAccount: pulumi.Output<string>;
  readonly sourceBucketUrl: pulumi.Output<string | undefined>;

  constructor(name: string, args: CloudFunctionArgs, opts: pulumi.ComponentResourceOptions = {}) {
    super('pkg:ons:components:CloudFunction', name, args, opts);

    const project = gcp.organizations.getProject({});

    const projectName = project.then((prj) => prj.name);

    const _localsDefaultServiceAccountEmail = pulumi.interpolate`${projectName}@appspot.gserviceaccount.com`;

    // Merge using the spread operator `...`
    const _envVars = {
      PROJECT: projectName,
      ...args.environmentVariables,
    };

    const _labels = {
      project: projectName,
      ...args.labels,
    };

    const source_bucket = new gcp.storage.Bucket(
      `source_${args.name}_bucket`,
      {
        name: `source-${args.name}-bucket`,
        forceDestroy: true,
        location: args.region || Variables.location.toUpperCase(),
        storageClass: 'STANDARD',
        uniformBucketLevelAccess: true,
        labels: _labels,
      },
      { parent: this }
    );

    const _source_object = new gcp.storage.BucketObject(
      `_source_${args.name}_object`,
      {
        name: pulumi.interpolate`${SparkMD5.hash(args.name.toString())}.zip`,
        bucket: source_bucket.name,
        source: new pulumi.asset.AssetArchive({
          '.': new pulumi.asset.FileArchive(args.source_directory),
        }),
      },
      { parent: this }
    );

    new gcp.storage.BucketIAMMember(
      `_source_${args.name}_binding`,
      {
        bucket: source_bucket.name,
        role: 'roles/storage.admin',
        member: pulumi.interpolate`serviceAccount:${args.service_account_email || _localsDefaultServiceAccountEmail}`,
      },
      { parent: this }
    );

    const cloud_function = new gcp.cloudfunctions.Function(
      `cloud_${args.name}_function`,
      {
        name: args.name,
        project: projectName,
        entryPoint: args.entryPoint || Variables.entryPoint,
        runtime: args.runtime || Variables.runtime,
        timeout: args.timeout || 30,
        availableMemoryMb: args.availableMemory || 128,
        serviceAccountEmail: args.service_account_email || _localsDefaultServiceAccountEmail,
        environmentVariables: _envVars,
        labels: _labels,
        region: args.region || Variables.location,
        sourceArchiveBucket: source_bucket.name,
        sourceArchiveObject: _source_object.name,
        triggerHttp: args.trigger_http,

        eventTrigger:
          args.trigger_http == undefined
            ? {
                eventType: args.trigger_event_type || 'google.storage.object.finalize',
                resource: args.trigger_event_resource || source_bucket.id,

                failurePolicy: {
                  retry: args.retry_on_failure || false,
                },
              }
            : undefined,
      },
      { parent: this }
    );

    new gcp.cloudfunctions.FunctionIamMember(
      `_function_${args.name}_invoker`,
      {
        project: cloud_function.project,
        region: cloud_function.region,
        cloudFunction: cloud_function.name,
        role: 'roles/cloudfunctions.invoker',
        member: pulumi.interpolate`serviceAccount:${cloud_function.serviceAccountEmail}`,
      },
      { parent: this }
    );

    if (args.slack_channel && args.slack_token) {
      new OperationalSlackAlert(cloud_function, args.slack_channel, args.slack_token);
    }

    this.functionEnvironmentVariables = cloud_function.environmentVariables;
    this.functionServiceAccount = cloud_function.serviceAccountEmail;
    this.sourceBucketUrl = source_bucket.url;

    this.registerOutputs({
      environmentVariables: this.functionEnvironmentVariables,
      serviceAccount: this.functionServiceAccount,
      sourceBucketUrl: this.sourceBucketUrl,
    });
  }
}
