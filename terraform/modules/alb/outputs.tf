output "security_group_id" {
  value = aws_security_group.alb.id
}

output "listener_prod_arn" {
  value = aws_lb_listener.prod.arn
}
output "listener_test_arn" {
  value = aws_lb_listener.test.arn
}


output "target_group_blue_arn" {
  value = aws_lb_target_group.blue.arn
}
output "target_group_blue_name" {
  value = aws_lb_target_group.blue.name
}

output "target_group_green_arn" {
  value = aws_lb_target_group.green.arn
}
output "target_group_green_name" {
  value = aws_lb_target_group.green.name
}
