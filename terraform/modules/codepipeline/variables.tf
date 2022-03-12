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

variable "ecr_app_arn" {
  type        = string
  description = "ARN of ECR for app image"
}

variable "ecr_nginx_arn" {
  type        = string
  description = "ARN of ECR for nginx image"
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
