import { Stack, StackProps, Duration, CfnOutput } from 'aws-cdk-lib';
import { CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpJwtAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import * as path from 'path';

export interface ApiStackProps extends StackProps {
  ticketsTable: Table;
  userPool: UserPool;
  userPoolClient: UserPoolClient;
}

const REPO_ROOT = path.join(__dirname, '..', '..');
const BACKEND_ROOT = path.join(REPO_ROOT, 'backend', 'functions');
const BACKEND_LOCK_FILE = path.join(REPO_ROOT, 'backend', 'package-lock.json');

export class ApiStack extends Stack {
  public readonly api: HttpApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { ticketsTable } = props;

    const syncDlq = new Queue(this, 'OfflineSyncDLQ', {
      queueName: 'inclusive-campus-support-offline-sync-dlq.fifo',
      fifo: true,
    });
    const syncQueue = new Queue(this, 'OfflineSyncQueue', {
      queueName: 'inclusive-campus-support-offline-sync.fifo',
      fifo: true,
      contentBasedDeduplication: false,
      visibilityTimeout: Duration.seconds(30),
      deadLetterQueue: { queue: syncDlq, maxReceiveCount: 5 },
    });

    const makeFunction = (name: string) =>
      new NodejsFunction(this, `${name}Fn`, {
        functionName: `inclusive-campus-support-${name}`,
        entry: path.join(BACKEND_ROOT, name, 'handler.ts'),
        handler: 'handler',
        runtime: Runtime.NODEJS_22_X,
        memorySize: 256,
        timeout: Duration.seconds(10),
        environment: { TICKETS_TABLE_NAME: ticketsTable.tableName },
        projectRoot: REPO_ROOT,
        depsLockFilePath: BACKEND_LOCK_FILE,
        bundling: { minify: true, sourceMap: true, target: 'node22' },
      });

    const createTicketFn = makeFunction('createTicket');
    const getTicketFn = makeFunction('getTicket');
    const listTicketsFn = makeFunction('listTickets');
    const updateTicketFn = makeFunction('updateTicket');
    const addTimelineEventFn = makeFunction('addTimelineEvent');
    const submitFeedbackFn = makeFunction('submitFeedback');
    const syncOfflineQueueFn = makeFunction('syncOfflineQueue');
    const syncWorkerFn = makeFunction('syncWorker');
    const getImpactMetricsFn = makeFunction('getImpactMetrics');
    const healthCheckFn = makeFunction('healthCheck');

    for (const fn of [
      createTicketFn,
      getTicketFn,
      listTicketsFn,
      updateTicketFn,
      addTimelineEventFn,
      submitFeedbackFn,
      syncWorkerFn,
      getImpactMetricsFn,
    ]) {
      ticketsTable.grantReadWriteData(fn);
    }

    syncOfflineQueueFn.addEnvironment('SYNC_QUEUE_URL', syncQueue.queueUrl);
    syncQueue.grantSendMessages(syncOfflineQueueFn);
    syncWorkerFn.addEventSource(new SqsEventSource(syncQueue, { batchSize: 10, reportBatchItemFailures: true }));

    this.api = new HttpApi(this, 'Api', {
      apiName: 'inclusive-campus-support-api',
      corsPreflight: {
        allowOrigins: ['*'], // tighten to the CloudFront domain once it's known (see infra/README.md)
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.PATCH, CorsHttpMethod.OPTIONS],
        allowHeaders: ['Content-Type', 'Idempotency-Key', 'Authorization'],
      },
    });

    // Staff-only mutations (status changes, timeline notes) require a signed-in
    // STAFF/ADMIN user. Ticket creation and reading stay open — students should
    // never need to sign in to get help. See src/domain/users/User.ts and
    // infra/lib/auth-stack.ts.
    const staffAuthorizer = new HttpJwtAuthorizer(
      'StaffAuthorizer',
      `https://cognito-idp.${this.region}.amazonaws.com/${props.userPool.userPoolId}`,
      { jwtAudience: [props.userPoolClient.userPoolClientId] },
    );

    this.api.addRoutes({ path: '/health', methods: [HttpMethod.GET], integration: new HttpLambdaIntegration('HealthInt', healthCheckFn) });
    this.api.addRoutes({ path: '/tickets', methods: [HttpMethod.POST], integration: new HttpLambdaIntegration('CreateTicketInt', createTicketFn) });
    this.api.addRoutes({ path: '/tickets', methods: [HttpMethod.GET], integration: new HttpLambdaIntegration('ListTicketsInt', listTicketsFn) });
    this.api.addRoutes({ path: '/tickets/{ticketId}', methods: [HttpMethod.GET], integration: new HttpLambdaIntegration('GetTicketInt', getTicketFn) });
    this.api.addRoutes({
      path: '/tickets/{ticketId}',
      methods: [HttpMethod.PATCH],
      integration: new HttpLambdaIntegration('UpdateTicketInt', updateTicketFn),
      authorizer: staffAuthorizer,
    });
    this.api.addRoutes({
      path: '/tickets/{ticketId}/timeline',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('AddTimelineEventInt', addTimelineEventFn),
      authorizer: staffAuthorizer,
    });
    this.api.addRoutes({
      path: '/tickets/{ticketId}/feedback',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('SubmitFeedbackInt', submitFeedbackFn),
    });
    this.api.addRoutes({ path: '/sync', methods: [HttpMethod.POST], integration: new HttpLambdaIntegration('SyncInt', syncOfflineQueueFn) });
    this.api.addRoutes({ path: '/impact', methods: [HttpMethod.GET], integration: new HttpLambdaIntegration('ImpactInt', getImpactMetricsFn) });

    new CfnOutput(this, 'ApiUrl', { value: this.api.apiEndpoint });
  }
}
