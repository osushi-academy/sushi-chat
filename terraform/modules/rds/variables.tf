variable "project" {
  type        = string
  description = "project name"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID where RDS instance is placed"
}

variable "subnet_ids" {
  type        = set(string)
  description = "Subnet IDs where RDS instance is placed"
}

variable "db_name" {
  type        = string
  description = "Database name"
}

variable "db_user" {
  type        = string
  description = "Database user name"
}

variable "db_password" {
  type        = string
  description = "Database password"
}
