import { Stack, StackProps, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { CfnUserPoolGroup, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

/**
 * Roles: STUDENT, STAFF, ADMIN (see src/domain/users/User.ts). Students can
 * submit and track requests without signing in at all — the service is
 * intentionally low-friction for the underserved-student persona. STAFF/ADMIN
 * accounts sign in through this pool; infra/lib/api-stack.ts attaches a JWT
 * authorizer scoped to STAFF/ADMIN groups on the staff-only mutating routes.
 */
export class AuthStack extends Stack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    this.userPool = new UserPool(this, 'StaffUserPool', {
      userPoolName: 'inclusive-campus-support-staff',
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      standardAttributes: { email: { required: true, mutable: true } },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.userPoolClient = this.userPool.addClient('StaffWebClient', {
      authFlows: { userPassword: true, userSrp: true },
      generateSecret: false,
      preventUserExistenceErrors: true,
    });

    new CfnUserPoolGroup(this, 'StaffGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'STAFF',
      description: 'Campus department staff who triage and resolve requests.',
    });

    new CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'ADMIN',
      description: 'Administrators with access to aggregate impact metrics and configuration.',
    });

    new CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    new CfnOutput(this, 'UserPoolClientId', { value: this.userPoolClient.userPoolClientId });
  }
}
