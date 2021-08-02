output "instance_public_dns" {
  value = aws_instance.main.public_dns
}

output "rds_endpoint" {
  value = aws_db_instance.main.endpoint
}

