# Wiki Task Manager - システム構成図

## 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                        ユーザー操作                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Chrome拡張機能 (Frontend)                     │
├─────────────────────────────────────────────────────────────────┤
│  - ポップアップUI (popup.html/js)                                │
│  - タスク入力フォーム                                             │
│  - タスク一覧表示                                                 │
│  - 完了チェックボックス                                           │
│  - Background Service Worker                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS/REST API
┌─────────────────────────────────────────────────────────────────┐
│              Node.js API Server (Backend)                        │
├─────────────────────────────────────────────────────────────────┤
│  Express.js                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API Endpoints                                          │   │
│  │  - POST   /api/tasks          (タスク追加)              │   │
│  │  - GET    /api/tasks          (タスク一覧取得)          │   │
│  │  - PATCH  /api/tasks/:id      (タスク更新)              │   │
│  │  - DELETE /api/tasks/:id      (タスク削除)              │   │
│  │  - POST   /api/tasks/:id/done (完了マーク)              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Services Layer                                         │   │
│  │  - GitHub Service (Octokit)                             │   │
│  │  - Markdown Parser Service                              │   │
│  │  - Task Manager Service                                 │   │
│  │  - Authentication Service                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ GitHub API v3
┌─────────────────────────────────────────────────────────────────┐
│                       GitHub API                                 │
├─────────────────────────────────────────────────────────────────┤
│  - GET  /repos/:owner/:repo/contents/:path                      │
│  - PUT  /repos/:owner/:repo/contents/:path                      │
│  - POST /repos/:owner/:repo/git/commits                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Git Push
┌─────────────────────────────────────────────────────────────────┐
│                  GitHub Repository (docs)                        │
├─────────────────────────────────────────────────────────────────┤
│  /docs                                                           │
│    - todo.md          ← タスク管理ファイル                       │
│    - tenets.md                                                   │
│    - constitution.md                                             │
│    - strategy.md                                                 │
│    - index.md                                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Auto Build
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Pages                                │
├─────────────────────────────────────────────────────────────────┤
│  https://tsukasa829.github.io/docs/                             │
│  - Jekyll自動ビルド                                               │
│  - 静的サイトとして公開                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## データフロー詳細

### 1. タスク追加フロー

```
[ユーザー] 
    ↓ タスク入力
[Chrome拡張 UI]
    ↓ { title: "新タスク", priority: "high" }
[POST /api/tasks]
    ↓
[Node.js Backend]
    ├→ GitHub API: GET todo.md (現在のファイル取得)
    ├→ Markdown Parser: todo.mdを解析
    ├→ Task Manager: 新タスクを追加
    ├→ Markdown Generator: 新しいMarkdownを生成
    └→ GitHub API: PUT todo.md (更新 + commit)
        ↓
[GitHub Repository]
    └→ todo.md更新 (commit: "Add task: 新タスク")
        ↓
[GitHub Pages]
    └→ 自動ビルド (2-3分後に反映)
        ↓
[Chrome拡張]
    └→ 成功通知表示
```

### 2. タスク完了フロー

```
[ユーザー]
    ↓ チェックボックスクリック
[Chrome拡張 UI]
    ↓ { taskId: "task-123", completed: true }
[POST /api/tasks/task-123/done]
    ↓
[Node.js Backend]
    ├→ GitHub API: GET todo.md
    ├→ Markdown Parser: taskId特定
    ├→ Task Manager: [ ] → [x] に変更
    └→ GitHub API: PUT todo.md
        ↓
[GitHub Repository]
    └→ todo.md更新 (commit: "Complete task: task-123")
```

---

## 技術スタック

### Chrome拡張機能
```javascript
{
  "manifest": {
    "version": 3,
    "permissions": [
      "storage",
      "activeTab"
    ]
  },
  "技術": [
    "Vanilla JS / React",
    "Chrome Storage API",
    "Fetch API"
  ]
}
```

### Node.js Backend
```javascript
{
  "フレームワーク": "Express.js",
  "ライブラリ": [
    "octokit/rest.js",        // GitHub API client
    "marked",                  // Markdown parser
    "gray-matter",             // Frontmatter parser
    "dotenv",                  // 環境変数管理
    "cors",                    // CORS対応
    "helmet",                  // セキュリティ
    "express-rate-limit"       // レート制限
  ],
  "デプロイ": "Vercel / Railway"
}
```

### GitHub Integration
```javascript
{
  "認証": "Personal Access Token (PAT)",
  "権限": [
    "repo",      // リポジトリアクセス
    "workflow"   // Actions実行 (optional)
  ]
}
```

---

## ファイル構造

### プロジェクト全体
```
/wiki-task-manager
├── /chrome-extension          # Chrome拡張
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── background.js
│   ├── styles.css
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
│
├── /backend                   # Node.js API
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   ├── server.js              # エントリーポイント
│   ├── /routes
│   │   └── tasks.js           # タスクAPI
│   ├── /services
│   │   ├── github.js          # GitHub API連携
│   │   ├── parser.js          # Markdown解析
│   │   └── taskManager.js     # タスク管理ロジック
│   ├── /middleware
│   │   ├── auth.js            # API認証
│   │   └── errorHandler.js    # エラーハンドリング
│   └── /utils
│       └── logger.js          # ログ
│
└── /docs                      # 既存のWikiリポジトリ
    └── (変更なし)
```

---

## セキュリティ設計

### 認証フロー
```
[Chrome拡張]
    ↓ API Key (環境変数で管理)
[Node.js Backend]
    ├→ API Key検証
    ├→ GitHub PAT使用 (サーバー側のみ)
    └→ レート制限適用
        ↓
[GitHub API]
```

### 保護されるデータ
- ✅ GitHub Personal Access Token (サーバー側のみ)
- ✅ API Key (Chrome拡張とBackendの認証)
- ✅ レート制限 (100リクエスト/15分)

---

## デプロイ構成

### Backend (Vercel推奨)
```yaml
環境変数:
  GITHUB_TOKEN: ghp_xxxxxxxxxxxxx
  GITHUB_OWNER: tsukasa829
  GITHUB_REPO: docs
  API_KEY: your-secret-api-key
  NODE_ENV: production

Functions:
  - api/tasks.js  (Serverless Function)
```

### Chrome拡張 (Chrome Web Store)
```yaml
環境変数 (拡張内):
  API_ENDPOINT: https://your-backend.vercel.app/api
  API_KEY: your-secret-api-key
```

---

## スケーラビリティ

### 将来の拡張性
```
現在: todo.md のみ
  ↓
Phase 2: 複数ファイル対応
  - tenets.md
  - strategy.md
  - constitution.md
  ↓
Phase 3: リアルタイム同期
  - WebSocket / Server-Sent Events
  ↓
Phase 4: マルチユーザー
  - GitHub OAuth Apps
  - ユーザー別認証
```

---

## パフォーマンス最適化

### キャッシュ戦略
```
[Chrome拡張]
  ├→ Local Storage: タスク一覧キャッシュ (5分)
  └→ 変更時のみAPI呼び出し

[Node.js Backend]
  ├→ メモリキャッシュ: todo.md内容 (1分)
  └→ 更新時にキャッシュ無効化

[GitHub API]
  └→ レート制限を考慮した呼び出し
```

---

## エラーハンドリング

### 想定されるエラー
```javascript
1. GitHub API レート制限
   → リトライロジック (Exponential Backoff)

2. Markdown解析エラー
   → 構文チェック + フォールバック

3. ネットワークエラー
   → オフライン検知 + ローカルキュー

4. 競合エラー (同時編集)
   → SHA比較 + マージ戦略
```

---

## 開発ロードマップ

### MVP (最小機能)
- [x] システム設計
- [ ] Backend API実装
- [ ] Chrome拡張UI実装
- [ ] GitHub連携実装
- [ ] ローカルテスト

### Phase 2 (機能拡張)
- [ ] 優先度・期限機能
- [ ] タグ機能
- [ ] 検索・フィルター
- [ ] 複数ファイル対応

### Phase 3 (高度化)
- [ ] リアルタイム同期
- [ ] 統計・分析機能
- [ ] モバイル対応

---

[← トップに戻る](index.md)
