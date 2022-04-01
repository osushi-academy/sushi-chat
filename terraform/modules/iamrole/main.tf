resource "aws_iam_role" "main" {
  name               = "${var.project}-iam-role-${var.service}"
  assume_role_policy = data.aws_iam_policy_document.main.json
}

data "aws_iam_policy_document" "main" {
  statement {
    actions = [
      "sts:AssumeRole"
    ]

    principals {
      type = "Service"
      identifiers = [
        "${var.service}.amazonaws.com"
      ]
    }
  }
}
