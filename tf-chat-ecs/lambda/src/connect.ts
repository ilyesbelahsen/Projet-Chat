import jwt from "jsonwebtoken";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { WS_TABLE, ddb } from "./dynamo";

interface JwtPayload {
  id: string;
  sub?: string;
  username?: string;
}

export const handleConnect = async (event: any) => {
  try {
    const token = event.queryStringParameters?.token;
    const roomId = event.queryStringParameters?.roomId;

    if (!token || !roomId) {
      console.error("Missing token or roomId");
      return { statusCode: 401, body: "Missing token or roomId" };
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const userId = payload.id || payload.sub;
    if (!userId) {
      console.error("Invalid token: no userId");
      return { statusCode: 401, body: "Invalid token" };
    }

    await ddb.send(
      new PutItemCommand({
        TableName: WS_TABLE,
        Item: {
          roomId: { S: String(roomId) },
          connectionId: { S: event.requestContext.connectionId },
          userId: { S: userId },
          username: { S: payload.username || "Unknown" },
          ttl: { N: `${Math.floor(Date.now() / 1000) + 7200}` }, // 2 hours TTL
        },
      })
    );

    return { statusCode: 200, body: "Connected" };
  } catch (err) {
    console.error("CONNECT ERROR", err);
    return { statusCode: 401, body: "Authentication failed" };
  }
};
