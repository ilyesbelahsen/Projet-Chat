output "alb_public_address" {
  value = aws_alb.external-endpoint.dns_name
}

output "chat-frontend-repo" {
  value = aws_ecr_repository.chat-frontend-repo.repository_url
}

output "chat-backend-repo" {
  value = aws_ecr_repository.chat-backend-repo.repository_url
}

# Outputs pour récupérer l'adresse RDS
output "chat_db_endpoint" {
  value = aws_db_instance.chat_db.address
}

output "chat_db_port" {
  value = aws_db_instance.chat_db.port
}