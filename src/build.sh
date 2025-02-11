#!/bin/bash

# 既存のビルドファイルをクリーンアップ
rm -rf build

# node_modulesを削除
rm -rf node_modules

# package-lock.jsonを削除
rm -f package-lock.json

# 依存関係を新規インストール
npm install

# プロダクションビルドを実行
GENERATE_SOURCEMAP=false npm run build

# Netlifyにデプロイ
npx netlify deploy --prod --dir=build

