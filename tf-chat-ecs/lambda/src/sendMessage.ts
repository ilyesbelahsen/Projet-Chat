import axios from "axios";
import { QueryCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { ddb, WS_TABLE } from "./dynamo";
import { wsClient } from "./ws";

export const handleSendMessage = async (event: any) => {
  try {
    const connectionId = event.requestContext.connectionId;
    const body = JSON.parse(event.body || "{}");
    const { roomId, content } = body;

    if (!roomId || !content) {
      return { statusCode: 400, body: "Missing roomId or content" };
    }

    // 1️⃣ Get the sender info from DynamoDB
    const senderQuery = await ddb.send(
      new QueryCommand({
        TableName: WS_TABLE,
        IndexName: "connectionId-index",
        KeyConditionExpression: "connectionId = :c",
        ExpressionAttributeValues: { ":c": { S: connectionId } },
      })
    );

    const senderItem = senderQuery.Items?.[0];
    if (!senderItem) {
      return { statusCode: 401, body: "Connection not found" };
    }

    const userId = senderItem.userId?.S;
    const username = senderItem.username?.S || "Unknown";

    if (!userId) {
      return { statusCode: 401, body: "User not authenticated" };
    }

    // 2️⃣ Create message via chat-service internal Lambda endpoint
    const chatServiceUrl = process.env.CHAT_SERVICE_INTERNAL || process.env.BACKEND_URL;
    const internalApiKey = process.env.INTERNAL_API_KEY;

    const res = await axios.post(
      `${chatServiceUrl}/internal/ws/lambda-send-message`,
      {
        userId,
        username,
        roomId: Number(roomId),
        content,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-internal-api-key": internalApiKey,
        },
        timeout: 10000,
      }
    );

    if (!res.data.success) {
      console.error("Chat service error:", res.data.error);
      return { statusCode: 400, body: res.data.error || "Failed to save message" };
    }

    const savedMessage = res.data.message;

    // 3️⃣ Get all connections in this room
    const connections = await ddb.send(
      new QueryCommand({
        TableName: WS_TABLE,
        KeyConditionExpression: "roomId = :r",
        ExpressionAttributeValues: { ":r": { S: String(roomId) } },
      })
    );

    const allConnections = connections.Items ?? [];

    // 4️⃣ Prepare message event (matching frontend expectations)
    const messageEvent = {
      type: "message",
      roomId: Number(roomId),
      message: {
        id: savedMessage.id,
        roomId: Number(roomId),
        userId: savedMessage.userId,
        username: savedMessage.username || username,
        content: savedMessage.content,
        createdAt: savedMessage.createdAt,
      },
    };

    // 5️⃣ Broadcast to all connections in the room
    await Promise.all(
      allConnections.map(async (item) => {
        try {
          await wsClient.send(
            new PostToConnectionCommand({
              ConnectionId: item.connectionId.S!,
              Data: Buffer.from(JSON.stringify(messageEvent)),
            })
          );
        } catch (err: any) {
          // Connection is stale (410 Gone) - clean it up
          if (err.statusCode === 410 || err.$metadata?.httpStatusCode === 410) {
            await ddb.send(
              new DeleteItemCommand({
                TableName: WS_TABLE,
                Key: {
                  roomId: item.roomId,
                  connectionId: item.connectionId,
                },
              })
            );
          } else {
            console.error(`Failed to send to ${item.connectionId.S}:`, err);
          }
        }
      })
    );

    return { statusCode: 200, body: "Message sent" };
  } catch (err: any) {
    console.error("SEND MESSAGE ERROR", err?.response?.data || err?.message || err);
    return { statusCode: 500, body: "Internal server error" };
  }
};
