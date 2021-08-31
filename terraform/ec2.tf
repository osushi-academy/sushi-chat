resource "aws_autoscaling_group" "main" {
  name                = "${var.project}-autoscaling-group"
  max_size            = 4
  min_size            = 2
  vpc_zone_identifier = [aws_subnet.public_a.id, aws_subnet.public_c.id]
  target_group_arns   = [aws_lb_target_group.main.arn]

  depends_on = [aws_db_instance.main, aws_elasticache_cluster.main]

  launch_template {
    id      = aws_launch_template.main.id
    version = "$Latest"
  }

  tags = concat(
    [
      {
        key                 = "Name"
        value               = "${var.project}-autoscaling-group"
        propagate_at_launch = false
      },
      {
        key                 = "Project"
        value               = var.project
        propagate_at_launch = false
      }
    ]
  )
}

resource "aws_launch_template" "main" {
  name                   = "${var.project}-launch-template"
  image_id               = var.ami.amazon-linux-2
  instance_type          = "t3.nano"
  key_name               = var.key-pair
  vpc_security_group_ids = [aws_security_group.public_instance.id]
  user_data              = filebase64("userdata.sh")

  iam_instance_profile {
    name = aws_iam_instance_profile.write_cloud_watch_logs.name
  }

  tag_specifications {
    resource_type = "instance"

    tags = {
      Name    = "${var.project}-ec2"
      Project = var.project
    }
  }

  tags = {
    Name    = "${var.project}-launch-template"
    Project = var.project
  }
}

resource "aws_iam_instance_profile" "write_cloud_watch_logs" {
  name = "write_cloud_watch_logs"
  role = aws_iam_role.write_cloud_watch_logs.name
}

resource "aws_iam_role" "write_cloud_watch_logs" {
  name = "write_cloud_watch_logs"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = {
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Sid    = "",
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }
  })

  tags = {
    Name    = "${var.project}-write_cloud_watch_logs"
    project = var.project
  }
}

resource "aws_iam_role_policy_attachment" "attach_cloud_watch_agent_server_policy" {
  role       = aws_iam_role.write_cloud_watch_logs.name
  policy_arn = data.aws_iam_policy.cloud_watch_agent_server_policy.arn
}

data "aws_iam_policy" "cloud_watch_agent_server_policy" {
  name = "CloudWatchAgentServerPolicy"
}

// TODO: 手動デプロイする必要がなくなったらprivateサブネットに配置する。ただその場合はNat Gatewayが必要になるので注意
resource "aws_security_group" "public_instance" {
  description = "This is a security group for API server for sushi-chat app. It allows http and https from alb, and ssh from admin."
  vpc_id      = aws_vpc.main.id

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = [var.cidr_default_gateway.ipv4] #tfsec:ignore:AWS009
    ipv6_cidr_blocks = [var.cidr_default_gateway.ipv6] #tfsec:ignore:AWS009
  }

  tags = {
    Name    = "${var.project}-sg-public-instance"
    project = var.project
  }
}

resource "aws_security_group_rule" "allow_ssh" {
  description       = "This allow ssh to public instance from admin."
  security_group_id = aws_security_group.public_instance.id
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = [var.my_global_ip]
}

resource "aws_security_group_rule" "allow_http" {
  description              = "This allows http from alb."
  security_group_id        = aws_security_group.public_instance.id
  type                     = "ingress"
  from_port                = 80
  to_port                  = 80
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.public_alb.id
}

resource "aws_security_group_rule" "allow_https" {
  description              = "This allows https from alb."
  security_group_id        = aws_security_group.public_instance.id
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.public_alb.id
}
