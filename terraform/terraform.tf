terraform {
  backend "s3" {
    bucket = "sushi-chat-terraform-181562662531"
    key    = "dev/terraform.tfstate"
    region = "ap-northeast-1"
  }
}

provider "aws" {
  region = "ap-northeast-1"
}
