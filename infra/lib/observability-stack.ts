import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Dashboard, GraphWidget, Alarm, ComparisonOperator, TreatMissingData, Metric } from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { HttpApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

export interface ObservabilityStackProps extends StackProps {
  api: HttpApi;
  alarmEmail?: string;
}

/**
 * Minimal but real observability: a dashboard for API traffic/latency plus
 * an alarm on the 5xx rate. Per-Lambda error/duration widgets are left out
 * here to keep this stack decoupled from ApiStack's function objects — see
 * README.md "Observability" for how to extend this with per-function metrics.
 */
export class ObservabilityStack extends Stack {
  constructor(scope: Construct, id: string, props: ObservabilityStackProps) {
    super(scope, id, props);

    const alarmTopic = new Topic(this, 'AlarmTopic', { topicName: 'inclusive-campus-support-alarms' });
    if (props.alarmEmail) {
      alarmTopic.addSubscription(new EmailSubscription(props.alarmEmail));
    }

    const namespace = 'AWS/ApiGateway';
    const dims = { ApiId: props.api.apiId };

    const requestCount = new Metric({ namespace, metricName: 'Count', dimensionsMap: dims, statistic: 'Sum', period: Duration.minutes(5) });
    const serverErrors = new Metric({ namespace, metricName: '5xx', dimensionsMap: dims, statistic: 'Sum', period: Duration.minutes(5) });
    const latency = new Metric({ namespace, metricName: 'Latency', dimensionsMap: dims, statistic: 'p99', period: Duration.minutes(5) });

    new Dashboard(this, 'Dashboard', {
      dashboardName: 'inclusive-campus-support',
      widgets: [
        [
          new GraphWidget({ title: 'API requests', left: [requestCount], width: 12 }),
          new GraphWidget({ title: 'API 5xx errors', left: [serverErrors], width: 12 }),
        ],
        [new GraphWidget({ title: 'API p99 latency (ms)', left: [latency], width: 24 })],
      ],
    });

    new Alarm(this, 'ServerErrorAlarm', {
      metric: serverErrors,
      threshold: 5,
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
      alarmDescription: 'API Gateway is returning 5xx errors — ticket creation or tracking is likely failing for users.',
    }).addAlarmAction(new SnsAction(alarmTopic));
  }
}
