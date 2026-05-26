import { App } from 'aws-cdk-lib';
import { GatewayStack } from '../src/utils/gateway-stack';

const app = new App();
new GatewayStack(app, 'SecureCrmEventGatewayStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
