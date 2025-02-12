#!/bin/bash

# エラーが発生したら即座に終了
set -e

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ログ出力関数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# デプロイメントURLを取得する関数
get_deployment_url() {
    vercel ls | grep -A1 "Age.*Status.*Environment" | tail -n1 | awk '{print $2}'
}

# デプロイメントの状態を確認する関数
check_deployment() {
    local max_attempts=5
    local attempt=1
    local wait_time=3

    while [ $attempt -le $max_attempts ]; do
        log_info "デプロイメントの確認を試行中... (${attempt}/${max_attempts})"

        # 最新のデプロイメントURLを取得
        local deployment_url
        deployment_url=$(get_deployment_url)

        if [ -n "$deployment_url" ]; then
            log_info "最新のデプロイメントURL: $deployment_url"
            
            # デプロイメントの状態を確認
            if vercel ls | grep -A1 "Age.*Status.*Environment" | tail -n1 | grep -q "Ready"; then
                log_info "デプロイメントは正常に完了しました"
                
                # ログの取得を試行
                if vercel logs "$deployment_url"; then
                    log_info "ログの取得に成功しました"
                    return 0
                else
                    log_warn "ログの取得に失敗しました"
                fi
            else
                log_warn "デプロイメントはまだ準備中です"
            fi
        else
            log_warn "デプロイメントURLの取得に失敗しました"
        fi

        if [ $attempt -lt $max_attempts ]; then
            log_warn "${wait_time}秒後に再試行します..."
            sleep $wait_time
            wait_time=$((wait_time + 2))
        fi
        attempt=$((attempt + 1))
    done

    log_error "デプロイメントの確認に失敗しました"
    log_error "Vercelダッシュボードで確認してください: https://vercel.com/dashboard"
    return 1
}

# メイン処理
main() {
    log_info "デプロイメントの確認を開始します..."
    
    if ! check_deployment; then
        exit 1
    fi
}

# スクリプトの実行
main

