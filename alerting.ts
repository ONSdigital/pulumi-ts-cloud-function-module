import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';

export class OperationalSlackAlert {
  constructor(cloudFunction: gcp.cloudfunctions.Function, slackChannel: pulumi.Input<string>, slackToken: pulumi.Input<string>) {
    const name = cloudFunction.name;

    const _slackMessage = `
        :warning: Function *${name}* has exited with either \`crash\`, \`timeout\`, \`connection error\` or \`error\` :exclamation:
        <https://console.cloud.google.com/functions/details/${cloudFunction.region}/${name}?project=${cloudFunction.project}&tab=logs| :cloud_functions: Logs>
        `;

    const _slack = new gcp.monitoring.NotificationChannel(
      `_slack_${name}`,
      {
        type: 'slack',
        displayName: `${name} Slack Notification`,
        description: `A slack notification channel for ${name}`,
        enabled: true,

        labels: {
          channel_name: slackChannel,
        },

        sensitiveLabels: {
          authToken: slackToken,
        },
      },
      { dependsOn: cloudFunction }
    );

    const _metric = new gcp.logging.Metric(
      `_metric_${name}`,
      {
        name: `${name}-metric`,
        description: `${name} metric`,

        filter: `
            resource.type="cloud_function"
            resource.labels.function_name="${name}"
            severity="DEBUG"
            "finished with status: 'crash'"
            OR
            "finished with status: 'error'"
            OR
            "finished with status: 'timeout'"
            OR
            "finished with status: 'connection error'"
            `,

        labelExtractors: {
          function_name: 'EXTRACT(resource.labels.function_name)',
        },

        metricDescriptor: {
          displayName: `${name}-metric-descriptor`,
          metricKind: 'DELTA',
          valueType: 'INT64',

          labels: [
            {
              key: 'function_name',
              valueType: 'STRING',
            },
          ],
        },
      },
      { dependsOn: cloudFunction }
    );

    new gcp.monitoring.AlertPolicy(
      `_alert_policy_${name}`,
      {
        displayName: `${name}-alert-policy`,
        combiner: 'OR',
        notificationChannels: [_slack.id],

        conditions: [
          {
            displayName: `${name} alert policy condition`,

            conditionThreshold: {
              comparison: 'COMPARISON_GT',
              duration: '0s',
              filter: `metric.type=\\"logging.googleapis.com/user/${_metric.id}\\" resource.type=\\"cloud_function\\"`,

              aggregations: [
                {
                  alignmentPeriod: '60s',
                  perSeriesAligner: 'ALIGN_DELTA',
                },
              ],

              trigger: {
                count: 1,
                percent: 0,
              },
            },
          },
        ],

        documentation: {
          content: _slackMessage,
          mimeType: 'text/markdown',
        },
      },
      { dependsOn: cloudFunction }
    );
  }
}
