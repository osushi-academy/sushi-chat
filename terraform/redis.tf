resource "aws_elasticache_cluster" "main" {
  cluster_id               = "${var.project}-elasticache-cluster"
  engine                   = "redis"
  node_type                = "cache.t3.micro"
  num_cache_nodes          = 1
  parameter_group_name     = "default.redis6.x"
  subnet_group_name        = aws_elasticache_subnet_group.main.name
  security_group_ids       = [aws_security_group.redis.id]
  snapshot_retention_limit = 0

  tags = {
    Name    = "${var.project}-elasticache-cluster"
    Project = var.project
  }
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project}-elasticache-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_c.id]
}

resource "aws_security_group" "redis" {
  description = "security group for ElastiCache-redis"
  name        = "${var.project}-sg-redis"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = [var.cidr_default_gateway.ipv4] #tfsec:ignore:AWS009
    ipv6_cidr_blocks = [var.cidr_default_gateway.ipv6] #tfsec:ignore:AWS009
  }

  tags = {
    Name    = "${var.project}-sg-redis"
    project = var.project
  }
}

resource "aws_security_group_rule" "allow_private_redis_access" {
  description              = "allow redis access from instances"
  security_group_id        = aws_security_group.redis.id
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.public_instance.id
}
