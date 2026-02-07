# --------------------------
# RDS MySQL instance
# --------------------------

resource "aws_db_subnet_group" "chat_db_subnet_group" {
  name       = "chat-db-subnet-group"
  subnet_ids = [ aws_subnet.private_1a.id, aws_subnet.private_1b.id] # tu peux ajouter private_1b si tu la débloques
  tags = {
    Name = "chat-db-subnet-group"
  }
}

resource "aws_db_instance" "chat_db" {
  identifier              = "chat-db"
  engine                  = "mysql"
  engine_version          = "8.0"
  instance_class          = "db.t3.micro"
  allocated_storage       = 20
  db_name                    = "chatdb"
  username                = var.db_username
  password                = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.chat_db_subnet_group.name
  vpc_security_group_ids  = [aws_security_group.main_security_group.id]
  skip_final_snapshot     = true
  publicly_accessible     = false
  multi_az                = false
  auto_minor_version_upgrade = true

  tags = {
    Name = "chat-db"
  }
}