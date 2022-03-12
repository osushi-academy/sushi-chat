module "data" {
  source = "../data"
}

resource "aws_ecs_cluster" "main" {
  name = var.project
}

resource "aws_ecs_service" "main" {
  name            = var.project
  cluster         = aws_ecs_cluster.main.arn
  task_definition = "${aws_ecs_task_definition.main.family}:${max(aws_ecs_task_definition.main.revision, data.aws_ecs_task_definition.main.revision)}"
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.subnet_ids
    security_groups = [aws_security_group.ecs.id]
    # FIXME: This is not secure, but saving NAT Gateway cost.
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "nginx"
    container_port   = 80
  }

  deployment_controller {
    type = "CODE_DEPLOY"
  }

  lifecycle {
    # These are changed by CodeDeploy
    ignore_changes = [task_definition, load_balancer]
  }
}

resource "aws_security_group" "ecs" {
  description = "Security Group for ECS"
  name        = "${var.project}-ecs"
  vpc_id      = var.vpc_id

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

resource "aws_security_group_rule" "http_from_alb" {
  security_group_id        = aws_security_group.ecs.id
  type                     = "ingress"
  from_port                = 80
  to_port                  = 80
  protocol                 = "tcp"
  source_security_group_id = var.alb_security_group_id
}

resource "aws_security_group_rule" "allow_access_postgres" {
  description              = "allow access to RDS instance from ECS tasks"
  security_group_id        = var.rds_security_group_id
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ecs.id
}

resource "aws_security_group_rule" "allow_access_redis" {
  description              = "allow redis access from ECS tasks"
  security_group_id        = var.redis_security_group_id
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ecs.id
}

resource "aws_ecs_task_definition" "main" {
  family                   = var.project
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = data.aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "app"
      image     = aws_ecr_repository.app.repository_url
      essential = true
      environment = [
        { name : "DATABASE_URL", value : var.database_url },
        { name : "SOCKET_IO_ADMIN_UI_PASSWORD", value : var.socket_io_admin_ui_password },
        { name : "REDIS_HOST", value : var.redis_host },
        { name : "CORS_ORIGIN", value : var.cors_origin },
        { name : "CORS_ORIGIN_PREVIEW", value : var.cors_origin_preview },
        { name : "SOCKET_IO_ADAPTER", value : "redis" },
        { name : "FIREBASE_ADMIN_PROJECT_ID", value : var.firebase_admin_project_id },
        { name : "FIREBASE_ADMIN_CLIENT_EMAIL", value : var.firebase_admin_client_email },
        { name : "FIREBASE_ADMIN_PRIVATE_KEY", value : var.firebase_admin_private_key }
      ]
      logConfiguration = {
        logDriver : "awslogs",
        options : {
          awslogs-region : module.data.region
          awslogs-stream-prefix : "app",
          awslogs-group : aws_cloudwatch_log_group.ecs_app.name
        }
      },
    },
    {
      name      = "nginx"
      image     = aws_ecr_repository.nginx.repository_url
      essential = true
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]
      logConfiguration = {
        logDriver : "awslogs",
        options : {
          awslogs-region : module.data.region,
          awslogs-stream-prefix : "nginx",
          awslogs-group : aws_cloudwatch_log_group.ecs_nginx.name
        }
      }
    }
  ])
}

data "aws_ecs_task_definition" "main" {
  task_definition = aws_ecs_task_definition.main.family
}

data "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"
}

resource "aws_ecr_repository" "app" {
  name = "${var.project}-app"
}

resource "aws_ecr_repository" "nginx" {
  name = "${var.project}-nginx"
}

resource "aws_cloudwatch_log_group" "ecs_app" {
  name = "/${var.project}/ecs/app"
}

resource "aws_cloudwatch_log_group" "ecs_nginx" {
  name = "/${var.project}/ecs/nginx"
}
