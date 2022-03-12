output "database_url" {
  value = "postgres://${aws_db_instance.main.username}:${aws_db_instance.main.password}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.name}"
}

output "security_group_id" {
  value = aws_security_group.db.id
}
