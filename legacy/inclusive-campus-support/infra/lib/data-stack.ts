import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, ProjectionType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface DataStackProps extends StackProps {
  /** DESTROY makes `cdk destroy` fully tear down the demo; use RETAIN for a real deployment. */
  removalPolicy?: RemovalPolicy;
}

/**
 * Single-table design (see backend/shared/dynamoTicketStore.ts):
 *   PK = TICKET#<ticketId>            -> the ticket item itself
 *   PK = IDEMP#<idempotencyKey>       -> idempotency marker (one createTicket -> one ticket, even retried)
 *   PK = COUNTER#TICKET               -> atomic sequence for CAMP-XXXX ids
 * GSI1 (StudentIndex):    GSI1PK = STUDENT#<studentId>,   GSI1SK = CREATED#<createdAt>   -> "my requests"
 * GSI2 (DepartmentIndex): GSI2PK = DEPARTMENT#<dept>,     GSI2SK = STATUS#<status>#<createdAt> -> staff dashboard
 */
export class DataStack extends Stack {
  public readonly ticketsTable: Table;

  constructor(scope: Construct, id: string, props: DataStackProps = {}) {
    super(scope, id, props);

    this.ticketsTable = new Table(this, 'TicketsTable', {
      tableName: 'inclusive-campus-support-tickets',
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: props.removalPolicy ?? RemovalPolicy.DESTROY,
    });

    this.ticketsTable.addGlobalSecondaryIndex({
      indexName: 'StudentIndex',
      partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.ticketsTable.addGlobalSecondaryIndex({
      indexName: 'DepartmentIndex',
      partitionKey: { name: 'GSI2PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });
  }
}
