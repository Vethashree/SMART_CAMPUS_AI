#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { DataStack } from '../lib/data-stack';
import { AuthStack } from '../lib/auth-stack';
import { ApiStack } from '../lib/api-stack';
import { FrontendStack } from '../lib/frontend-stack';
import { ObservabilityStack } from '../lib/observability-stack';

const app = new App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'ap-south-1',
};

const alarmEmail = app.node.tryGetContext('alarmEmail') as string | undefined;

const dataStack = new DataStack(app, 'InclusiveCampusSupport-Data', { env });
const authStack = new AuthStack(app, 'InclusiveCampusSupport-Auth', { env });

const apiStack = new ApiStack(app, 'InclusiveCampusSupport-Api', {
  env,
  ticketsTable: dataStack.ticketsTable,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
});
apiStack.addStackDependency(dataStack);
apiStack.addStackDependency(authStack);

new FrontendStack(app, 'InclusiveCampusSupport-Frontend', { env });

const observabilityStack = new ObservabilityStack(app, 'InclusiveCampusSupport-Observability', {
  env,
  api: apiStack.api,
  alarmEmail,
});
observabilityStack.addStackDependency(apiStack);
