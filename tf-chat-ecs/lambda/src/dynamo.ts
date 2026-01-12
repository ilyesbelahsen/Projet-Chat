import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const ddb = new DynamoDBClient({
  region: "us-east-1",
});

export const WS_TABLE = "ws-connections";
