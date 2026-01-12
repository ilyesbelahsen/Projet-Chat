import {
  ApiGatewayManagementApiClient,
} from "@aws-sdk/client-apigatewaymanagementapi";

export const wsClient = new ApiGatewayManagementApiClient({
  endpoint: process.env.WS_ENDPOINT,
});
