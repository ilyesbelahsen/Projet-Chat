import {
  ApiGatewayManagementApiClient,
} from "@aws-sdk/client-apigatewaymanagementapi";

// Convert wss:// to https:// for API Gateway Management API
function getHttpsEndpoint(): string {
  const wsEndpoint = process.env.WS_ENDPOINT || "";
  // Replace wss:// with https:// and ws:// with http://
  return wsEndpoint.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");
}

export const wsClient = new ApiGatewayManagementApiClient({
  endpoint: getHttpsEndpoint(),
});
