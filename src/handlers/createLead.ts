import { randomUUID } from 'node:crypto';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { logger } from '../utils/logger';
import { validateLead } from '../utils/validation';

const TABLE_NAME = process.env.TABLE_NAME ?? '';
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function response(
  statusCode: number,
  body: Record<string, unknown>,
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext?.requestId ?? 'local';

  logger.info('Lead ingestion request received', {
    requestId,
    path: event.path,
    httpMethod: event.httpMethod,
  });

  let payload: unknown;
  try {
    payload = JSON.parse(event.body ?? '{}');
  } catch {
    logger.warn('Invalid JSON payload', { requestId });
    return response(400, { message: 'Request body is not valid JSON.' });
  }

  const { valid, errors } = validateLead(payload);
  if (!valid) {
    logger.warn('Lead validation failed', { requestId, errors });
    return response(400, { message: 'Validation failed.', errors });
  }

  const { customerName, email } = payload as { customerName: string; email: string };
  const leadId = randomUUID();
  const item = {
    leadId,
    customerName: customerName.trim(),
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
    source: 'crm-event-gateway',
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: 'attribute_not_exists(leadId)',
      }),
    );
  } catch (err) {
    logger.error('Failed to persist lead', {
      requestId,
      leadId,
      error: err instanceof Error ? err.message : String(err),
    });
    return response(500, { message: 'Internal error while storing lead.' });
  }

  logger.info('Lead stored successfully', { requestId, leadId });
  return response(201, { message: 'Lead created.', leadId });
};
