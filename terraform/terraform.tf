terraform {
  required_version = "1.1.2"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }

  backend "s3" {
    bucket  = "sushi-chat-terraform-181562662531"
    key     = "dev/terraform.tfstate"
    region  = "ap-northeast-1"
    encrypt = true
    profile = "terraform"
  }
}

provider "aws" {
  region  = "ap-northeast-1"
  profile = "sushi-chat"

  default_tags {
    tags = {
      project = "sushi-chat"
    }
  }
}
