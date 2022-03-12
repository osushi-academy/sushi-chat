variable "project" {
  type        = string
  description = "project name"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID where ECS service is placed"
}

variable "subnet_ids" {
  type        = set(string)
  description = "set of Subnet ID where ECS service is placed"
}

variable "target_group_arn" {
  type        = string
  description = "Target Group ARN used for ALB"
}

variable "alb_security_group_id" {
  type        = string
  description = "Security Group ID for ALB that sends request to ECS"
}

variable "rds_security_group_id" {
  type        = string
  description = "Security Group ID for RDS"
}

variable "redis_security_group_id" {
  type        = string
  description = "Security Group ID for ElastiCache-redis"
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

variable "task_cpu" {
  type        = number
  description = "CPU size of ECS task"
  default     = 256
}

variable "task_memory" {
  type        = number
  description = "Memory size of ECS task"
  default     = 512
}

variable "task_count" {
  type        = number
  description = "desired count of ECS tasks"
  default     = 2
}
