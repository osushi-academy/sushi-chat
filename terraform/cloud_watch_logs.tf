// EC2上のamazon-cloudwatch-agentによって勝手に作られるのでTerraformで管理不要

//resource "aws_cloudwatch_log_group" "nginx-access-log" {
//  name = "/${var.project}/ec2/nginx/access.log"
//
//  tags = {
//    Name = "${var.project}/ec2/nginx/access.log"
//    project = var.project
//  }
//}
//
//resource "aws_cloudwatch_log_stream" "nginx-access-log" {
//  name = aws_instance.main.id
//  log_group_name = aws_cloudwatch_log_group.nginx-access-log.name
//}
//
//resource "aws_cloudwatch_log_group" "nginx-error-log" {
//  name = "/${var.project}/ec2/nginx/error.log"
//
//  tags = {
//    Name = "${var.project}/ec2/nginx/error.log"
//    project = var.project
//  }
//}
//
//resource "aws_cloudwatch_log_stream" "nginx-error-log" {
//  name = aws_instance.main.id
//  log_group_name = aws_cloudwatch_log_group.nginx-error-log.name
//}
//
//resource "aws_cloudwatch_log_group" "app-info-log" {
//  name = "/${var.project}/ec2/app/info.log"
//
//  tags = {
//    Name = "${var.project}/ec2/app/info.log"
//    project = var.project
//  }
//}
//
//resource "aws_cloudwatch_log_stream" "app-infolog" {
//  name = aws_instance.main.id
//  log_group_name = aws_cloudwatch_log_group.app-info-log.name
//}
//
//resource "aws_cloudwatch_log_group" "app-error-log" {
//  name = "/${var.project}/ec2/app/error.log"
//
//  tags = {
//    Name = "${var.project}/ec2/app/error.log"
//    project = var.project
//  }
//}
//
//resource "aws_cloudwatch_log_stream" "app-error-log" {
//  name = aws_instance.main.id
//  log_group_name = aws_cloudwatch_log_group.app-error-log.name
//}
//
