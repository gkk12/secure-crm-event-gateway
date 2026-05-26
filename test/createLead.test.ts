import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../src/handlers/createLead';

const ddbMock = mockClient(DynamoDBDocumentClient);

function buildEvent(body: unknown): APIGatewayProxyEvent {
  return {
    body: typeof body === 'string' ? body : JSON.stringify(body),
    httpMethod: 'POST',
    path: '/leads',
    requestContext: { requestId: 'test-request-id' },
  } as unknown as APIGatewayProxyEvent;
}

describe('createLead handler', () => {
  beforeEach(() => ddbMock.reset());

  it('returns 201 and stores the lead for a valid payload', async () => {
    ddbMock.on(PutCommand).resolves({});
    const res = await handler(buildEvent({ customerName: 'John Doe', email: 'john@vw.com' }));
    expect(res.statusCode).toBe(201);
    expect(ddbMock).toHaveReceivedCommandTimes(PutCommand, 1);
    expect(JSON.parse(res.body).leadId).toBeDefined();
  });

  it('returns 400 for an invalid payload', async () => {
    const res = await handler(buildEvent({ email: 'john@vw.com' }));
    expect(res.statusCode).toBe(400);
    expect(ddbMock).toHaveReceivedCommandTimes(PutCommand, 0);
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await handler(buildEvent('{ not json'));
    expect(res.statusCode).toBe(400);
  });

  it('returns 500 when DynamoDB fails', async () => {
    ddbMock.on(PutCommand).rejects(new Error('DynamoDB unavailable'));
    const res = await handler(buildEvent({ customerName: 'John Doe', email: 'john@vw.com' }));
    expect(res.statusCode).toBe(500);
  });
});