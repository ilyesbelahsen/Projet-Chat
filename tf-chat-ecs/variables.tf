variable "cluster_name" {
  default = "chat-cluster"
}

variable "profile" {
  default = "default"
}

variable "lab_role" {
  description = "ARN of the IAM role for ECS tasks and Lambda"
}

variable "lab_instance_profile" {
  description = "ARN of the IAM instance profile for ECS EC2 instances"
}

variable "aws_account_id" {
  description = "AWS account ID"
}

# Database credentials
variable "db_username" {
  description = "Database master username"
  default     = "admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  sensitive   = true
}

variable "auth_db_name" {
  description = "Auth service database name"
  default     = "auth_db"
}

variable "chat_db_name" {
  description = "Chat service database name"
  default     = "chat_db"
}

# JWT and API Keys
variable "jwt_secret" {
  description = "JWT secret for token signing"
  sensitive   = true
}

variable "internal_api_key" {
  description = "Internal API key for service-to-service communication"
  sensitive   = true
}
