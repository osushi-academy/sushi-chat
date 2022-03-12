variable "project" {
  type        = string
  description = "project name"
  default     = "sushi-chat"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for VPC"
}

variable "subnet_cidr_public_a" {
  type        = string
  description = "CIDR block for Subnet public a"
}

variable "subnet_cidr_public_c" {
  type        = string
  description = "CIDR block for Subnet public c"
}

variable "subnet_cidr_public_d" {
  type        = string
  description = "CIDR block for Subnet public d"
}

variable "subnet_cidr_private_a" {
  type        = string
  description = "CIDR block for Subnet private a"
}

variable "subnet_cidr_private_c" {
  type        = string
  description = "CIDR block for Subnet private c"
}

variable "subnet_cidr_private_d" {
  type        = string
  description = "CIDR block for Subnet private d"
}

variable "db_name" {
  type        = string
  description = "Database name for RDS"
}

variable "db_user" {
  type        = string
  description = "Database user name for RDS"
}

variable "db_password" {
  type        = string
  description = "Database password for RDS"
}

variable "socket_io_admin_ui_password" {
  type        = string
  description = "password for Socket IO Admin UI"
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
  description = "project id of Firebase admin"
}

variable "firebase_admin_client_email" {
  type        = string
  description = "client email of Firebase admin"
}

variable "firebase_admin_private_key" {
  type        = string
  description = "private key of Firebase admin"
}

variable "domain" {
  type = string
}

variable "github_org" {
  type        = string
  description = "GitHub Organization name that stores code repository"
}

variable "github_repository" {
  type        = string
  description = "GitHub repository name that stores code for application"
}
