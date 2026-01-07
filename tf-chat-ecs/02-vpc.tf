// Declare network resources

resource "aws_vpc" "main" {
  cidr_block = "172.16.0.0/16"
  tags = {
    Name = "chat-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "chat-internet-gateway"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "chat-public-route-table"
  }
}

resource "aws_route" "public_internet_gateway" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}

resource "aws_route_table" "private_1a" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "chat-private-route-table-1a"
  }
}

resource "aws_route_table" "private_1b" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "chat-private-route-table-1b"
  }
}

resource "aws_eip" "public_ip" {
  domain = "vpc"
}

resource "aws_nat_gateway" "ngw" {
  allocation_id = aws_eip.public_ip.id
  subnet_id = aws_subnet.public_1a.id
  depends_on = [aws_internet_gateway.main]
}

resource "aws_subnet" "public_1a" {
  cidr_block = "172.16.0.0/24"
  vpc_id = aws_vpc.main.id
  availability_zone = "us-east-1a"
  map_public_ip_on_launch = true
  tags = {
    Name = "chat-subnet-1a"
  }
}

resource "aws_subnet" "public_1b" {
  cidr_block = "172.16.1.0/24"
  vpc_id = aws_vpc.main.id
  availability_zone = "us-east-1b"
  map_public_ip_on_launch = true
  tags = {
    Name = "chat-subnet-1b"
  }
}

resource "aws_subnet" "private_1a" {
  cidr_block = "172.16.2.0/24"
  vpc_id = aws_vpc.main.id
  availability_zone = "us-east-1a"
  tags = {
    Name = "chat-subnet-private"
  }
}

# resource "aws_subnet" "private_1b" {
#   cidr_block = "172.16.3.0/24"
#   vpc_id = aws_vpc.main.id
#   availability_zone = "us-east-1b"
#   tags = {
#     Name = "chat-subnet-private"
#   }
# }


resource "aws_route_table_association" "public-1a" {
  subnet_id      = aws_subnet.public_1a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public-1b" {
  subnet_id      = aws_subnet.public_1b.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private-1a" {
  subnet_id      = aws_subnet.private_1a.id
  route_table_id = aws_route_table.private_1a.id
}

# resource "aws_route_table_association" "private-1b" {
#   subnet_id      = aws_subnet.private_1b.id
#   route_table_id = aws_route_table.private_1a
# }

resource "aws_route" "private_to_nat_gateway_1a" {
  route_table_id = aws_route_table.private_1a.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id = aws_nat_gateway.ngw.id
}

# resource "aws_route" "private_to_nat_gateway_1b" {
#   route_table_id = aws_route_table.private_1b.id
#   destination_cidr_block = "0.0.0.0/0"
#   nat_gateway_id = aws_nat_gateway.ngw.id
# }

resource "aws_security_group" "main_security_group" {
  name        = "chat-ecs-sg"
  description = "Allow All Ports Inbound and Outbound"

  vpc_id = aws_vpc.main.id

}

# Allow ALB to contact the ECS containers range ports
resource "aws_security_group_rule" "open-all-ingress" {
  type = "ingress"

  from_port = 0
  to_port   = 65535

  protocol = "tcp"

  description = "Allow traffic to containers"

  cidr_blocks = ["0.0.0.0/0"]

  # The security group to apply this rule to.
  security_group_id = aws_security_group.main_security_group.id
}

# Allow ALB to contact the ECS containers range ports
resource "aws_security_group_rule" "open-all-egress" {
  type = "egress"

  from_port = 0
  to_port   = 65535

  protocol = "tcp"

  description = "Allow traffic from containers"

  cidr_blocks = ["0.0.0.0/0"]

  # The security group to apply this rule to.
  security_group_id = aws_security_group.main_security_group.id
}