variable "project" {
  type = string
}

variable "my_global_ip" {
  type = string
}

variable "region" {
  type    = string
  default = "ap-northeast-1"
}

variable "az" {
  type = map(string)
  default = {
    a = "ap-northeast-1a"
    c = "ap-northeast-1c"
    d = "ap-northeast-1d"
  }
}

variable "cidr_default_gateway" {
  type = map(string)
  default = {
    ipv4 = "0.0.0.0/0"
    ipv6 = "::/0"
  }
}

variable "vpc_cidr" {
  type = string
}

variable "subnet_cidr" {
  type = map(map(string))
  default = {
    public = {
      a = ""
      c = ""
      d = ""
    }
    private = {
      a = ""
      c = ""
      d = ""
    }
  }
}

variable "ami" {
  type = map(string)
  default = {
    amazon-linux-2 = ""
    sushi-chat     = ""
  }
}

variable "key-pair" {
  type = string
}

variable "rds" {
  type = map(string)
  default = {
    user     = ""
    db_name  = ""
    password = ""
  }
}

variable "domain" {
  type = string
}
