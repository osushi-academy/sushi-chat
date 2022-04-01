variable "project" {
  type        = string
  description = "project name"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID where Redis instances are placed"
}

variable "subnet_ids" {
  type        = set(string)
  description = "Subnet Ids where Redis instances are placed"
}
