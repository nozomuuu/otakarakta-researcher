#!/bin/bash

# 最新のデプロイメントURLを取得
DEPLOYMENT_URL=$(vercel ls --json | node -e "
  const deployments = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
  const latest = deployments.find(d => d.state === 'READY');
  console.log(latest ? latest.url : '');
")

if [ -z "$DEPLOYMENT_URL" ]; then
  echo "エラー: 有効なデプロイメントが見つかりません"
  exit 1
fi

echo "最新のデプロイメント: $DEPLOYMENT_URL"
echo "ログを取得中..."

vercel logs "$DEPLOYMENT_URL"

