resource "aws_codedeploy_app" "deploy-app" {
  name = "${var.project}-deploy-app"
}

resource "aws_codedeploy_deployment_group" "deploy-group" {
  app_name              = aws_codedeploy_app.deploy-app.name
  deployment_group_name = "${var.project}-deploy-group"
  service_role_arn      = aws_iam_role.deploy-service-role.arn
  autoscaling_groups    = [aws_autoscaling_group.main.name]
}

resource "aws_iam_role" "deploy-service-role" {
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        Sid : "",
        Effect : "Allow",
        Principal : {
          Service : [
            "codedeploy.ap-northeast-1.amazonaws.com"
          ]
        },
        Action : "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name    = "${var.project}-deploy-service-role"
    Project = var.project
  }
}

resource "aws_iam_role_policy_attachment" "deploy-role" {
  role       = aws_iam_role.deploy-service-role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
}

// GitHubからdeployをするときに使うポリシー。ユーザーをterraformで直接作成するのはセキュリティの観点上めんどくさいので、
// このポリシーを使ってユーザーを手動で作成する。
resource "aws_iam_policy" "code-deploy" {
  name = "${var.project}-code-deploy"

  policy = jsonencode({
    Version : "2012-10-17",
    Statement : [
      {
        Sid : "",
        Effect : "Allow",
        Action : [
          "codedeploy:CreateDeployment"
        ],
        Resource : [
          aws_codedeploy_deployment_group.deploy-group.arn
        ]
      },
      {
        Sid : "",
        Effect : "Allow",
        Action : [
          "codedeploy:GetDeploymentConfig"
        ],
        Resource : [
          "arn:aws:codedeploy:ap-northeast-1:181562662531:deploymentconfig:CodeDeployDefault.OneAtATime"
        ]
      },
      {
        Sid : "",
        Effect : "Allow",
        Action : [
          "codedeploy:RegisterApplicationRevision",
          "codedeploy:GetApplicationRevision"
        ],
        Resource : [
          aws_codedeploy_app.deploy-app.arn
        ]
      }
    ]
  })
}
