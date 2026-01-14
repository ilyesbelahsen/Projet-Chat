import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const ddb = new DynamoDBClient({
  region: process.env.AWS_REGION_CUSTOM || process.env.AWS_REGION || "us-east-1",
});

export const WS_TABLE = process.env.DYNAMODB_TABLE || "ws-connections";
