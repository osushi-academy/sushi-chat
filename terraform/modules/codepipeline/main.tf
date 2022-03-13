module "data" {
  source = "../data"
}

resource "aws_codepipeline" "main" {
  name     = var.project
  role_arn = module.codepipeline_role.arn

  artifact_store {
    location = aws_s3_bucket.codepipeline_artifact.bucket
    type     = "S3"
  }

  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["source_output"]

      configuration = {
        ConnectionArn    = aws_codestarconnections_connection.main.arn
        FullRepositoryId = "${var.github_org}/${var.github_repository}"
        BranchName       = var.github_branch
      }
    }
  }

  stage {
    name = "Build"

    action {
      name             = "Build"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]
      version          = "1"

      configuration = {
        ProjectName = aws_codebuild_project.main.name
      }
    }
  }

  stage {
    name = "Deploy"

    action {
      name            = "Deploy"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "CodeDeployToECS"
      input_artifacts = ["source_output", "build_output"]
      version         = "1"

      configuration = {
        ApplicationName                = aws_codedeploy_app.main.name
        DeploymentGroupName            = aws_codedeploy_deployment_group.main.deployment_group_name
        TaskDefinitionTemplateArtifact = "build_output"
        AppSpecTemplateArtifact        = "build_output"
        Image1ArtifactName             = "build_output"
        Image1ContainerName            = "IMAGE1_NAME"
      }
    }
  }
}

resource "aws_s3_bucket" "codepipeline_artifact" {
  bucket = "${var.project}-codepipeline-artifact"
  acl    = "private"
}

module "codepipeline_role" {
  source  = "../iamrole"
  project = var.project
  service = "codepipeline"
}

resource "aws_iam_role_policy" "codepipeline_policy" {
  name = "codepipeline_policy"
  role = module.codepipeline_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetBucketVersioning",
          "s3:PutObjectAcl",
          "s3:PutObject"
        ]
        Resource = [
          aws_s3_bucket.codepipeline_artifact.arn,
          "${aws_s3_bucket.codepipeline_artifact.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "codestar-connections:UseConnection"
        ]
        Resource = aws_codestarconnections_connection.main.arn
      },
      {
        Effect = "Allow"
        Action = [
          "codebuild:BatchGetBuilds",
          "codebuild:StartBuild"
        ]
        Resource : aws_codebuild_project.main.arn
      },
      {
        Effect = "Allow"
        Action = [
          "codedeploy:CreateDeployment",
          "codedeploy:GetApplication",
          "codedeploy:GetApplicationRevision",
          "codedeploy:GetDeployment",
          "codedeploy:GetDeploymentConfig",
          "codedeploy:RegisterApplicationRevision"
        ]
        Resource = [
          aws_codedeploy_app.main.arn,
          aws_codedeploy_deployment_group.main.arn,
          "arn:aws:codedeploy:${module.data.region}:${module.data.account_id}:deploymentconfig:${aws_codedeploy_deployment_group.main.deployment_config_name}"
        ]
      },
      {
        Effect   = "Allow"
        Action   = "ecs:RegisterTaskDefinition"
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecs:DescribeServices",
          "ecs:DescribeTaskDefinition",
          "ecs:DescribeTasks",
          "ecs:ListTasks",
          "ecs:UpdateService"
        ]
        Resource = [
          var.ecs_cluster_arn,
          var.ecs_service_arn,
          "arn:aws:ecs:${module.data.region}:${module.data.account_id}:task-definition/${var.ecs_task_family}:*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = "iam:PassRole"
        Resource = var.ecs_task_execution_role_arn
      }
    ]
  })
}

resource "aws_codestarconnections_connection" "main" {
  name          = var.project
  provider_type = "GitHub"
}

resource "aws_codebuild_project" "main" {
  name         = var.project
  description  = "codebuild_project for ${var.project}"
  service_role = module.codebuild_role.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  source {
    type = "CODEPIPELINE"
  }

  # TODO: use secrets manager to store sensitive information
  environment {
    compute_type    = "BUILD_GENERAL1_SMALL"
    image           = "aws/codebuild/amazonlinux2-x86_64-standard:3.0"
    type            = "LINUX_CONTAINER"
    privileged_mode = true

    environment_variable {
      name  = "AWS_REGION"
      value = module.data.region
    }

    environment_variable {
      name  = "TASK_FAMILY"
      value = var.ecs_task_family
    }

    environment_variable {
      name  = "TASK_CPU"
      value = var.ecs_task_cpu
    }

    environment_variable {
      name  = "TASK_MEMORY"
      value = var.ecs_task_memory
    }

    environment_variable {
      name  = "EXECUTION_ROLE_ARN"
      value = var.ecs_task_execution_role_arn
    }

    environment_variable {
      name  = "DATABASE_URL"
      value = var.database_url
    }

    environment_variable {
      name  = "SOCKET_IO_ADMIN_UI_PASSWORD"
      value = var.socket_io_admin_ui_password
    }

    environment_variable {
      name  = "REDIS_HOST"
      value = var.redis_host
    }

    environment_variable {
      name  = "CORS_ORIGIN"
      value = var.cors_origin
    }

    environment_variable {
      name  = "CORS_ORIGIN_PREVIEW"
      value = var.cors_origin_preview
    }

    environment_variable {
      name  = "FIREBASE_ADMIN_PROJECT_ID"
      value = var.firebase_admin_project_id
    }

    environment_variable {
      name  = "FIREBASE_ADMIN_CLIENT_EMAIL"
      value = var.firebase_admin_client_email
    }

    environment_variable {
      name  = "FIREBASE_ADMIN_PRIVATE_KEY"
      value = var.firebase_admin_private_key
    }

    environment_variable {
      name  = "APP_LOG_GROUP"
      value = var.ecs_task_app_log_group
    }

    environment_variable {
      name  = "NGINX_LOG_GROUP"
      value = var.ecs_task_nginx_log_group
    }

    environment_variable {
      name  = "APP_IMAGE_URI"
      value = var.ecr_app_repository_url
    }

    environment_variable {
      name  = "NGINX_IMAGE_URI"
      value = var.ecr_nginx_repository_url
    }
  }

  logs_config {
    cloudwatch_logs {
      group_name = aws_cloudwatch_log_group.codebuild.name
    }
  }
}

module "codebuild_role" {
  source  = "../iamrole"
  project = var.project
  service = "codebuild"
}

resource "aws_iam_role_policy" "codebuild" {
  role = module.codebuild_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetBucketVersioning",
          "s3:PutObjectAcl",
          "s3:PutObject"
        ]
        "Resource" = [
          aws_s3_bucket.codepipeline_artifact.arn,
          "${aws_s3_bucket.codepipeline_artifact.arn}/*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = "ecr:GetAuthorizationToken"
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:CompleteLayerUpload",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart"
        ]
        Resource = [
          var.ecr_app_arn,
          var.ecr_nginx_arn
        ]
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "codebuild" {
  name = "/${var.project}/codebuild"
}

resource "aws_codedeploy_app" "main" {
  name             = var.project
  compute_platform = "ECS"
}

resource "aws_codedeploy_deployment_group" "main" {
  deployment_group_name  = var.project
  app_name               = aws_codedeploy_app.main.name
  deployment_config_name = "CodeDeployDefault.ECSAllAtOnce"
  service_role_arn       = module.codedeploy_role.arn

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }

  blue_green_deployment_config {
    deployment_ready_option {
      action_on_timeout    = "STOP_DEPLOYMENT"
      wait_time_in_minutes = 30
    }

    terminate_blue_instances_on_deployment_success {
      action                           = "TERMINATE"
      termination_wait_time_in_minutes = 5
    }
  }

  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type   = "BLUE_GREEN"
  }

  ecs_service {
    cluster_name = var.ecs_cluster_name
    service_name = var.ecs_service_name
  }

  load_balancer_info {
    target_group_pair_info {
      prod_traffic_route {
        listener_arns = [var.lb_listener_prod_arn]
      }

      test_traffic_route {
        listener_arns = [var.lb_listener_test_arn]
      }

      target_group {
        name = var.lb_target_group_blue_name
      }

      target_group {
        name = var.lb_target_group_green_name
      }
    }
  }
}

module "codedeploy_role" {
  source  = "../iamrole"
  project = var.project
  service = "codedeploy"
}

resource "aws_iam_role_policy_attachment" "codedeploy" {
  role       = module.codedeploy_role.id
  policy_arn = data.aws_iam_policy.codedeploy_role.arn
}

data "aws_iam_policy" "codedeploy_role" {
  name = "AWSCodeDeployRoleForECS"
}
