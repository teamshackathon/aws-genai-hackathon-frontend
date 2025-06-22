# ビルドステージ: Node.jsを使用してアプリをビルド
FROM node:24-alpine as build

# 作業ディレクトリを設定
WORKDIR /app

# パッケージ関連ファイルのみをコピー（パフォーマンス最適化のため）
COPY package.json package-lock.json* ./

# 依存関係のインストール
RUN npm ci --quiet

# ソースコードをコピー
COPY . .

# サブディレクトリのパスを環境変数で指定可能にする
ARG BASE_PATH=/bae-recipe
ENV VITE_BASE_PATH=$BASE_PATH
ENV VITE_PUBLIC_API_URL=https://api.bae-recipe.com/api/v1

# アプリケーションをビルド
RUN npm run build

# 実行ステージ: Nginxの軽量イメージを利用して静的ファイルを配信
FROM nginx:stable-alpine as production

# タイムゾーンを設定
ENV TZ=Asia/Tokyo

# Nginxの設定ファイルをコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginxの設定を最適化
COPY --from=build /app/dist /usr/share/nginx/html

# ヘルスチェック用のパスを設定
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# セキュリティ強化のため不要な権限を削除
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]