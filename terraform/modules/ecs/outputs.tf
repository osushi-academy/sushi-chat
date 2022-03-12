output "cluster_arn" {
  value = aws_ecs_cluster.main.arn
}
output "cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "service_arn" {
  value = aws_ecs_service.main.id
}
output "service_name" {
  value = aws_ecs_service.main.name
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs.id
}

output "task_family" {
  value = aws_ecs_task_definition.main.family
}
output "task_execution_role_arn" {
  value = data.aws_iam_role.ecs_task_execution_role.arn
}

output "ecr_app_arn" {
  value = aws_ecr_repository.app.arn
}
output "ecr_nginx_arn" {
  value = aws_ecr_repository.nginx.arn
}
output "ecr_nginx_repository_url" {
  value = aws_ecr_repository.nginx.repository_url
}
