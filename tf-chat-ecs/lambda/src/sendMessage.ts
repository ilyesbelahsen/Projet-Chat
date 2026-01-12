import axios from "axios";
import { QueryCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { ddb, WS_TABLE } from "./dynamo";
import { wsClient } from "./ws";

export const handleSendMessage = async (event: any) => {
  try {
    const { roomId, content } = JSON.parse(event.body);
    if (!roomId || !content) return { statusCode: 400 };

    // 1️⃣ Créer message via backend REST
    const res = await axios.post(
      `${process.env.BACKEND_URL}/rooms/${roomId}/messages`,
      { content },
      { headers: { Authorization: `Bearer ${process.env.SERVICE_TOKEN}` } }
    );
    const message = res.data;

    // 2️⃣ Récupérer toutes les connexions de la room
    const connections = await ddb.send(
      new QueryCommand({
        TableName: WS_TABLE,
        KeyConditionExpression: "roomId = :r",
        ExpressionAttributeValues: { ":r": { S: roomId } },
      })
    );

    const allConnections = connections.Items ?? [];

    // 3️⃣ Broadcast à toutes les connections
    await Promise.all(
      allConnections.map(async (item) => {
        try {
          await wsClient.send(
            new PostToConnectionCommand({
              ConnectionId: item.connectionId.S!,
              Data: Buffer.from(
                JSON.stringify({ action: "newMessage", message })
              ),
            })
          );
        } catch (err: any) {
          if (err.statusCode === 410) {
            // Connection fermée → supprimer
            await ddb.send(
              new DeleteItemCommand({
                TableName: WS_TABLE,
                Key: {
                  roomId: item.roomId,
                  connectionId: item.connectionId,
                },
              })
            );
          }
        }
      })
    );

    return { statusCode: 200 };
  } catch (err) {
    console.error("SEND MESSAGE ERROR", err);
    return { statusCode: 500 };
  }
};
