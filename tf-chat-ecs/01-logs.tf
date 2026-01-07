locals {
  log_groups = [
    "/aws/ecs/${var.cluster_name}/chat-frontend",
    "/aws/ecs/${var.cluster_name}/chat-backend"
  ]
}

resource "aws_cloudwatch_log_group" "cloudwatch-logs" {
  count = length(local.log_groups)
  name = element(local.log_groups, count.index)
  retention_in_days = 14
}
