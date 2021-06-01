resource "aws_db_subnet_group" "main" {
  name       = "${var.project}-db-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_c.id]

  tags = {
    Name    = "${var.project}-db-subnet-group"
    project = var.project
  }
}

resource "aws_security_group" "db" {
  description = "For persistent DB. Several events, e.g. entering room, chats and reactions, are stored."
  vpc_id      = aws_vpc.main.id

  tags = {
    Name    = "${var.project}-sg-db"
    project = var.project
  }
}

resource "aws_security_group_rule" "allow_private_postgres_access" {
  description = "This allows access to postgres from public instance."
  security_group_id        = aws_security_group.db.id
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.public_instance.id
}

resource "aws_db_instance" "main" {
  identifier             = "${var.project}-db-instance"
  engine                 = "postgres"
  engine_version         = "12.5"
  instance_class         = "db.t2.micro"
  name                   = var.rds.db_name
  username               = var.rds.user
  password               = var.rds.password
  allocated_storage      = 10
  storage_type           = "gp2"
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  skip_final_snapshot    = true

  tags = {
    Name    = "${var.project}-db-instance"
    project = var.project
  }
}