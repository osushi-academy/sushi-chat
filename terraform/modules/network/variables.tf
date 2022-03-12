variable "project" {
  type        = string
  description = "project name"
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
