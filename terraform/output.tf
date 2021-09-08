output "rds_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "elasticache_nodes" {
  value = aws_elasticache_cluster.main.cache_nodes
}

