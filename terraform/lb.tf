#tfsec:ignore:AWS005
resource "aws_lb" "main" {
  load_balancer_type = "application"
  name               = "${var.project}-alb"
  security_groups    = [aws_security_group.public_alb.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_c.id]

  tags = {
    Name    = "${var.project}-alb"
    project = var.project
  }
}

resource "aws_security_group" "public_alb" {
  description = "This is a security group for public alb for API servers of sushi-chat app."
  name   = "${var.project}-sg-alb"
  vpc_id = aws_vpc.main.id

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = [var.cidr_default_gateway.ipv4] #tfsec:ignore:AWS009
    ipv6_cidr_blocks = [var.cidr_default_gateway.ipv6] #tfsec:ignore:AWS009
  }

  tags = {
    Name    = "${var.project}-sg-alb"
    project = var.project
  }
}

resource "aws_security_group_rule" "public_http" {
  description = "This allows http from internet."
  security_group_id = aws_security_group.public_alb.id
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks      = [var.cidr_default_gateway.ipv4] #tfsec:ignore:AWS006
  ipv6_cidr_blocks = [var.cidr_default_gateway.ipv6] #tfsec:ignore:AWS006
}

resource "aws_security_group_rule" "public_https" {
  description = "This allows https from internet."
  security_group_id = aws_security_group.public_alb.id
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks      = [var.cidr_default_gateway.ipv4] #tfsec:ignore:AWS006
  ipv6_cidr_blocks = [var.cidr_default_gateway.ipv6] #tfsec:ignore:AWS006
}

resource "aws_lb_target_group" "main" {
  name        = "${var.project}-target-group"
  vpc_id      = aws_vpc.main.id
  port        = 80
  protocol    = "HTTP"
  target_type = "instance"

  health_check {
    port = 80
    path = "/"
  }

  tags = {
    Name    = "${var.project}-target-group"
    project = var.project
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  certificate_arn   = aws_acm_certificate.main.arn
  port              = 443
  protocol          = "HTTPS"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}

resource "aws_lb_listener" "redirect_http_to_https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}