import { QueryCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { ddb, WS_TABLE } from "./dynamo";

export const handleDisconnect = async (event: any) => {
  try {
    const connectionId = event.requestContext.connectionId;

    const res = await ddb.send(
      new QueryCommand({
        TableName: WS_TABLE,
        IndexName: "connectionId-index",
        KeyConditionExpression: "connectionId = :c",
        ExpressionAttributeValues: {
          ":c": { S: connectionId },
        },
      })
    );

    if (!res.Items) return { statusCode: 200 };

    await Promise.all(
      res.Items.map((item) =>
        ddb.send(
          new DeleteItemCommand({
            TableName: WS_TABLE,
            Key: {
              roomId: item.roomId, // essentiel pour supprimer
              connectionId: item.connectionId,
            },
          })
        )
      )
    );

    return { statusCode: 200 };
  } catch (err) {
    console.error("DISCONNECT ERROR", err);
    return { statusCode: 200 };
  }
};
