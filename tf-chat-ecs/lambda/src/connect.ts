import jwt from "jsonwebtoken";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { WS_TABLE, ddb } from "./dynamo";

export const handleConnect = async (event: any) => {
  try {
    const token = event.queryStringParameters?.token;
    const roomId = event.queryStringParameters?.roomId;

    if (!token || !roomId) return { statusCode: 401 };

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    await ddb.send(
      new PutItemCommand({
        TableName: WS_TABLE,
        Item: {
          roomId: { S: roomId }, // essentiel
          connectionId: { S: event.requestContext.connectionId },
          userId: { S: payload.id },
          ttl: { N: `${Math.floor(Date.now() / 1000) + 3600}` },
        },
      })
    );

    return { statusCode: 200 };
  } catch (err) {
    console.error("CONNECT ERROR", err);
    return { statusCode: 401 };
  }
};
