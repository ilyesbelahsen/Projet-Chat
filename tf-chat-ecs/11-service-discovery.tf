# ------------------------
# AWS Service Discovery (Cloud Map) - DISABLED
# Not available in AWS Academy/Lab due to permission restrictions
# Using internal ALB DNS names instead for service-to-service communication
# ------------------------

# Service Discovery requires servicediscovery:CreatePrivateDnsNamespace permission
# which is not available in AWS Lab environments.
#
# Alternative: Use internal ALB DNS names directly:
# - auth-service: http://${aws_alb.auth_service_alb.dns_name}
# - chat-service: http://${aws_alb.chat_service_alb.dns_name}
