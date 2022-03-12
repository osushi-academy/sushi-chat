variable "project" {
  type        = string
  description = "project name"
}

variable "vpc_id" {
  type        = string
  description = "VPC id where ALB is placed"
}

variable "subnet_ids" {
  type        = set(string)
  description = "Subnet ids where ALB is placed"
}

variable "acm_cert_arn" {
  type        = string
  description = "ACM certificate ARN"
}

variable "domain" {
  type        = string
  description = "domain name for Route53"
}

variable "route53_zone_id" {
  type        = string
  description = "zone id of Route53"
}
