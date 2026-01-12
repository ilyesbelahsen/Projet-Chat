import { handleConnect } from "./connect";
import { handleDisconnect } from "./disconnect";
import { handleSendMessage } from "./sendMessage";

export const handler = async (event: any) => {
  switch (event.requestContext.routeKey) {
    case "$connect":
      return handleConnect(event);
    case "$disconnect":
      return handleDisconnect(event);
    case "sendMessage":
      return handleSendMessage(event);
    default:
      return { statusCode: 400, body: "Unknown route" };
  }
};
