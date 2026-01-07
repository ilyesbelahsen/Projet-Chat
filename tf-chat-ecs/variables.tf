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
