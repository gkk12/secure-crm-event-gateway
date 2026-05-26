# Secure CRM Event Gateway

A serverless microservice that ingests customer leads from an external
system, validates them, and persists them to DynamoDB.

Incoming POST -> API Gateway -> AWS Lambda (Node.js/TS) -> DynamoDB
Structured JSON logs are emitted for Datadog-style ingestion.

## Stack
AWS CDK (TypeScript) · Lambda · DynamoDB · API Gateway · Jest · ESLint · Prettier · GitHub Actions