variable "cluster_name" {
  default = "chat-cluster"
}

variable "profile" {
  default = "default"
}

variable "lab_role" {
  default = "arn:aws:iam::942388166843:role/LabRole"
}

variable "lab_instance_profile" {
  default = "arn:aws:iam::942388166843:instance-profile/LabInstanceProfile"
}

variable "aws_account_id" {
  description = "AWS account ID"
  default     = "942388166843"
}

# Database credentials
variable "db_username" {
  description = "Database master username"
  default     = "admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  default     = "Password123!"
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
  default     = "2ed8863fa44af2d10c0a8bf5b3daf803869ea5116a26cf091b70020424c41c3206b23bf0b8470186928f71bcec7956255e0f3e520ce7d0a8dc62338e0cc6f233"
  sensitive   = true
}

variable "internal_api_key" {
  description = "Internal API key for service-to-service communication"
  default     = "BvujKcptkLkHNXVl5ACYcNvWvNTMJ6ZABhr26mB21zzrBO99edOF5KASoVOKkj1A"
  sensitive   = true
}
