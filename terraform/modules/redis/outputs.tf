output "hostname" {
  value = aws_elasticache_cluster.main.cache_nodes[0]["address"]
}

output "security_group_id" {
  value = aws_security_group.redis.id
}
