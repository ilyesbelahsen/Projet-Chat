output "alb_public_address" {
  value = aws_alb.external-endpoint.dns_name
}

output "chat-frontend-repo" {
  value = aws_ecr_repository.chat-frontend-repo.repository_url
}

output "chat-backend-repo" {
  value = aws_ecr_repository.chat-backend-repo.repository_url
}
