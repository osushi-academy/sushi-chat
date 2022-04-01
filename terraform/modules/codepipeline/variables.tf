variable "project" {
  type        = string
  description = "project name"
}

variable "github_org" {
  type        = string
  description = "GitHub organization name that owns source repository"
}

variable "github_repository" {
  type        = string
  description = "GitHub repository name for source code"
}

variable "github_branch" {
  type        = string
  description = "Git branch name for trigger"
  default     = "main"
}

variable "ecs_cluster_arn" {
  type        = string
  description = "ARN of ECS Cluster"
}

variable "ecs_cluster_name" {
  type        = string
  description = "ECS Cluster name"
}

variable "ecs_service_arn" {
  type        = string
  description = "ARN of ECS Service"
}

variable "ecs_service_name" {
  type        = string
  description = "ECS Service name"
}

variable "ecs_task_family" {
  type        = string
  description = "Family name of ECS Task"
}

variable "ecs_task_execution_role_arn" {
  type        = string
  description = "ARN of ECS Task Execution Role"
}

variable "database_url" {
  type        = string
  description = "Database URL"
}

variable "socket_io_admin_ui_password" {
  type        = string
  description = "password for Socket IO Admin UI"
}

variable "redis_host" {
  type        = string
  description = "hostname for Redis"
}

variable "cors_origin" {
  type        = string
  description = "hostname of CORS origin"
}

variable "cors_origin_preview" {
  type        = string
  description = "hostname of CORS origin for preview"
}

variable "firebase_admin_project_id" {
  type        = string
  description = "project ID of Firebase admin"
}

variable "firebase_admin_client_email" {
  type        = string
  description = "client email of Firebase admin"
}

variable "firebase_admin_private_key" {
  type        = string
  description = "private key of Firebase admin"
}

variable "ecs_task_cpu" {
  type        = number
  description = "CPU for ECS Task"
}

variable "ecs_task_memory" {
  type        = number
  description = "Memory size for ECS Task"
}

variable "ecs_task_app_log_group" {
  type        = string
  description = "CloudWatch Log Group name for ecs task app container"
}

variable "ecs_task_nginx_log_group" {
  type        = string
  description = "CloudWatch Log Group name for ecs task nginx container"
}

variable "ecr_app_arn" {
  type        = string
  description = "ARN of ECR for app image"
}

variable "ecr_nginx_arn" {
  type        = string
  description = "ARN of ECR for nginx image"
}

variable "ecr_app_repository_url" {
  type        = string
  description = "ECR repository URL for app image"
}

variable "ecr_nginx_repository_url" {
  type        = string
  description = "ECR repository URL for Nginx image"
}

variable "lb_listener_prod_arn" {
  type        = string
  description = "ARN of LB listener for prod traffic"
}

variable "lb_listener_test_arn" {
  type        = string
  description = "ARN of LB Listener for test traffic"
}

variable "lb_target_group_blue_name" {
  type        = string
  description = "name of LB Target Group blue"
}

variable "lb_target_group_green_name" {
  type        = string
  description = "name of LB Target Group green"
}
