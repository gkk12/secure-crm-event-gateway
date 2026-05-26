import { App } from 'aws-cdk-lib';
import { GatewayStack } from '../src/utils/gateway-stack';
import { CicdStack } from '../src/utils/cicd-stack';

const app = new App();
new GatewayStack(app, 'SecureCrmEventGatewayStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new CicdStack(app, 'CrmCicdStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  githubOwner: 'gkk12',
  githubRepo: 'secure-crm-event-gateway',
});
