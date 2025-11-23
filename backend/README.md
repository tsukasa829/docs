# GitHub API Proxy Server

シンプルなGitHub APIプロキシサーバー。すべてのGitHub APIリクエストを転送します。

## 🚀 セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
```bash
cp .env.example .env
```

`.env`を編集してGitHub Personal Access Tokenを設定:
```env
GITHUB_TOKEN=ghp_your_personal_access_token_here
PORT=50321
NODE_ENV=development
ALLOWED_ORIGINS=chrome-extension://your-extension-id
```

### 3. GitHub Personal Access Tokenの取得
1. https://github.com/settings/tokens にアクセス
2. "Generate new token (classic)" をクリック
3. 必要な権限を選択: `repo` (Full control of private repositories)
4. トークンをコピーして `.env` に設定

## 🏃 起動方法

### 開発モード (nodemon)
```bash
npm run dev
```

### PM2で起動 (推奨)
```bash
# 初回起動
npm start

# 再起動
npm run restart

# 停止
npm stop

# ログ確認
npm run logs
```

### PM2 Windowsスタートアップ設定
```powershell
# 管理者権限でPowerShellを開く
npm install -g pm2-windows-startup
pm2-startup install

# 通常のPowerShellで
npm start
npm run save
```

サーバーは `http://localhost:50321` で起動します。

## 📡 API使用方法

### Health Check
```bash
GET http://localhost:50321/health
```

**レスポンス例:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-23T12:00:00.000Z",
  "port": 50321,
  "github": "connected"
}
```

### GitHub API Proxy

すべてのGitHub APIリクエストを `/api/*` 経由で実行できます。

#### ファイル取得
```bash
GET http://localhost:50321/api/repos/tsukasa829/docs/contents/docs/todo.md
```

#### ファイル更新
```bash
PUT http://localhost:50321/api/repos/tsukasa829/docs/contents/docs/todo.md
Content-Type: application/json

{
  "message": "Update todo.md",
  "content": "base64_encoded_content",
  "sha": "current_file_sha"
}
```

#### その他のGitHub API
```bash
# リポジトリ情報
GET http://localhost:50321/api/repos/tsukasa829/docs

# コミット履歴
GET http://localhost:50321/api/repos/tsukasa829/docs/commits

# ディレクトリ一覧
GET http://localhost:50321/api/repos/tsukasa829/docs/contents/docs
```

すべての[GitHub REST API](https://docs.github.com/en/rest)が利用可能です。

## 🔧 PM2コマンド

```bash
pm2 list                 # アプリ一覧
pm2 logs wiki-proxy      # ログ表示
pm2 restart wiki-proxy   # 再起動
pm2 stop wiki-proxy      # 停止
pm2 delete wiki-proxy    # 削除
pm2 monit                # モニタリング
```

## 📁 ファイル構成

```
backend/
├── server.js              # メインサーバー
├── ecosystem.config.js    # PM2設定
├── package.json
├── .env.example
├── .env                   # (gitignore)
└── logs/                  # PM2ログ (自動生成)
```

## 🐛 トラブルシューティング

### ポート50321が使用中の場合
`.env`ファイルで別のポートに変更:
```env
PORT=50322
```

### GitHub接続エラー
- `.env`のGITHUB_TOKENが正しいか確認
- トークンの権限に`repo`が含まれているか確認
- `/health`エンドポイントで接続状態を確認

### PM2が見つからない
```bash
npm install -g pm2
```

## 📝 ライセンス

MIT

### Quick Memo
```
POST /api/memo
```

## Deploy to Vercel

```bash
vercel
```

## Environment Variables

- `GITHUB_TOKEN` - GitHub Personal Access Token
- `GITHUB_OWNER` - Repository owner (tsukasa829)
- `GITHUB_REPO` - Repository name (docs)
- `API_KEY` - API authentication key
- `PORT` - Server port (default: 3000)
- `ALLOWED_ORIGINS` - CORS origins
