resource "aws_db_subnet_group" "main" {
  name       = var.project
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "db" {
  name        = "${var.project}-sg-db"
  description = "for RDS instance"
  vpc_id      = var.vpc_id

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

resource "aws_db_instance" "main" {
  identifier             = "${var.project}-db-instance"
  engine                 = "postgres"
  engine_version         = "12.7"
  instance_class         = "db.t3.micro"
  name                   = var.db_name
  username               = var.db_user
  password               = var.db_password
  allocated_storage      = 20
  storage_type           = "gp2"
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
}
