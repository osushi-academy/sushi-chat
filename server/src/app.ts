import express from "express";

const app = express();

const PORT = process.env.PORT || 7000;

//これはチェックにちょっと表示してるだけ
app.get("/", function (_req, res) {
  res.send("hello world");
});

//これは立ててる
app.listen(PORT, function () {
  console.log("server listening. Port:" + PORT);
});
