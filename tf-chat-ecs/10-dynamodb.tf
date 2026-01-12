# ------------------------
# DynamoDB WebSocket Table
# ------------------------
resource "aws_dynamodb_table" "ws_connections" {
  name         = "ws-connections"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "roomId"
  range_key = "connectionId"

  attribute {
    name = "roomId"
    type = "S"
  }

  attribute {
    name = "connectionId"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  global_secondary_index {
    name            = "connectionId-index"
    hash_key        = "connectionId"
    projection_type = "ALL"
  }

  tags = {
    Project = "cloud-projet"
  }
}
