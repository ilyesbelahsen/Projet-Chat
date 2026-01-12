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
