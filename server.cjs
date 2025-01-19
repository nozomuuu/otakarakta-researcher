const Redis = require("ioredis");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

// Redis 設定
const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
    console.log("Redisに接続成功しました！");
});

redis.on("error", (err) => {
    console.error("Redis接続エラー:", err);
});

app.get("/", (req, res) => {
    res.send("サーバーが動作しています！");
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`サーバーがポート ${PORT} で起動中`);
});
