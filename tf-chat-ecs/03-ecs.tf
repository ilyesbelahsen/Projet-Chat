// ECS Cluster configuration

resource "aws_ecs_cluster" "chat" {
  name = var.cluster_name
}

module "cluster_instances" {
  source                = "./tf-aws-ecs-container-instance"
  name                  = "chat"
  ecs_cluster_name      = aws_ecs_cluster.chat.name
  lc_instance_type      = "t2.nano"
  lc_security_group_ids = [aws_security_group.main_security_group.id]
  asg_subnet_ids        = [aws_subnet.private_1a.id]
  lab_role              = var.lab_role
  lab_instance_profile  = var.lab_instance_profile
}