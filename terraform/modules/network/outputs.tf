output "vpc_id" {
  value = aws_vpc.main.id
}

output "subnet_id_public_a" {
  value = aws_subnet.public_a.id
}

output "subnet_id_public_c" {
  value = aws_subnet.public_c.id
}

output "subnet_id_private_a" {
  value = aws_subnet.private_a.id
}

output "subnet_id_private_c" {
  value = aws_subnet.private_c.id
}
