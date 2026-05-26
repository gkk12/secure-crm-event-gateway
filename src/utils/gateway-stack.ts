import * as path from 'node:path';
import { Stack, StackProps, RemovalPolicy, CfnOutput, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';

export class GatewayStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // --- DynamoDB: Leads table -----------------------------------------
    const leadsTable = new Table(this, 'LeadsTable', {
      tableName: 'Leads',
      partitionKey: { name: 'leadId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // --- Lambda: createLead handler ------------------------------------
    const createLeadFn = new NodejsFunction(this, 'CreateLeadFunction', {
      functionName: 'crm-create-lead',
      runtime: Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../src/handlers/createLead.ts'),
      handler: 'handler',
      memorySize: 128,
      timeout: Duration.seconds(10),
      environment: { TABLE_NAME: leadsTable.tableName },
      logGroup: new LogGroup(this, 'CreateLeadLogGroup', {
        retention: RetentionDays.ONE_WEEK,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
      bundling: { minify: true, target: 'node22' },
    });

    // Least-privilege IAM: function may ONLY write to the Leads table
    leadsTable.grantWriteData(createLeadFn);

    // --- API Gateway: HTTP entrypoint ---------------
    const api = new LambdaRestApi(this, 'CrmGatewayApi', {
      restApiName: 'crm-event-gateway',
      handler: createLeadFn,
      proxy: false,
      deployOptions: { stageName: 'prod' },
    });

    const leads = api.root.addResource('leads');
    leads.addMethod('POST');

    new CfnOutput(this, 'ApiInvokeUrl', {
      value: api.url,
      description: 'Base URL of the CRM Event Gateway API',
    });
  }
}
