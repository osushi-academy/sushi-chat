module "network" {
  source                = "./modules/network"
  project               = var.project
  vpc_cidr              = var.vpc_cidr
  subnet_cidr_public_a  = var.subnet_cidr_public_a
  subnet_cidr_public_c  = var.subnet_cidr_public_c
  subnet_cidr_public_d  = var.subnet_cidr_public_d
  subnet_cidr_private_a = var.subnet_cidr_private_a
  subnet_cidr_private_c = var.subnet_cidr_private_c
  subnet_cidr_private_d = var.subnet_cidr_private_d
}

module "route53" {
  source = "./modules/route53"
  domain = var.domain
}

module "rds" {
  source     = "./modules/rds"
  project    = var.project
  vpc_id     = module.network.vpc_id
  subnet_ids = [module.network.subnet_id_private_a, module.network.subnet_id_private_c]

  # credential
  db_name     = var.db_name
  db_user     = var.db_user
  db_password = var.db_password
}

module "redis" {
  source     = "./modules/redis"
  project    = var.project
  vpc_id     = module.network.vpc_id
  subnet_ids = [module.network.subnet_id_private_a, module.network.subnet_id_private_c]
}

module "alb" {
  source          = "./modules/alb"
  project         = var.project
  vpc_id          = module.network.vpc_id
  subnet_ids      = [module.network.subnet_id_public_a, module.network.subnet_id_public_c]
  acm_cert_arn    = module.route53.cert_arn
  domain          = var.domain
  route53_zone_id = module.route53.zone_id
}

module "ecs" {
  source  = "./modules/ecs"
  project = var.project
  vpc_id  = module.network.vpc_id
  // TODO: 本当はprivateサブネットに置きたいが、NAT Gatewayの料金が高いので保留している
  subnet_ids              = [module.network.subnet_id_public_a, module.network.subnet_id_public_c]
  target_group_arn        = module.alb.target_group_blue_arn
  alb_security_group_id   = module.alb.security_group_id
  rds_security_group_id   = module.rds.security_group_id
  redis_security_group_id = module.redis.security_group_id

  # for application env var
  database_url                = module.rds.database_url
  socket_io_admin_ui_password = var.socket_io_admin_ui_password
  redis_host                  = module.redis.hostname
  cors_origin                 = var.cors_origin
  cors_origin_preview         = var.cors_origin_preview
  firebase_admin_project_id   = var.firebase_admin_project_id
  firebase_admin_client_email = var.firebase_admin_client_email
  firebase_admin_private_key  = var.firebase_admin_private_key
}

module "codepipeline" {
  source  = "./modules/codepipeline"
  project = var.project

  github_org        = var.github_org
  github_repository = var.github_repository
  github_branch     = var.github_branch

  ecs_cluster_arn             = module.ecs.cluster_arn
  ecs_cluster_name            = module.ecs.cluster_name
  ecs_service_arn             = module.ecs.service_arn
  ecs_service_name            = module.ecs.service_name
  ecs_task_family             = module.ecs.task_family
  ecs_task_execution_role_arn = module.ecs.task_execution_role_arn
  ecs_task_cpu                = module.ecs.task_cpu
  ecs_task_memory             = module.ecs.task_memory

  database_url                = module.rds.database_url
  socket_io_admin_ui_password = var.socket_io_admin_ui_password
  redis_host                  = module.redis.hostname
  cors_origin                 = var.cors_origin
  cors_origin_preview         = var.cors_origin_preview
  firebase_admin_project_id   = var.firebase_admin_project_id
  firebase_admin_client_email = var.firebase_admin_client_email
  firebase_admin_private_key  = var.firebase_admin_private_key

  ecs_task_app_log_group   = module.ecs.task_app_log_group_name
  ecs_task_nginx_log_group = module.ecs.task_nginx_log_group_name

  ecr_app_arn              = module.ecs.ecr_app_arn
  ecr_nginx_arn            = module.ecs.ecr_nginx_arn
  ecr_app_repository_url   = module.ecs.ecr_app_repository_url
  ecr_nginx_repository_url = module.ecs.ecr_nginx_repository_url

  lb_listener_prod_arn       = module.alb.listener_prod_arn
  lb_listener_test_arn       = module.alb.listener_test_arn
  lb_target_group_blue_name  = module.alb.target_group_blue_name
  lb_target_group_green_name = module.alb.target_group_green_name
}
