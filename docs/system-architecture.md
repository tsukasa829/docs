# Wiki Editor System - システム構成図

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
│  - タスク管理 (todo.md)                                          │
│  - メモエディタ (tenets, strategy, constitution)                │
│  - クイック追加フォーム                                           │
│  - ファイル選択機能                                               │
│  - Background Service Worker                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS/REST API
┌─────────────────────────────────────────────────────────────────┐
│              Node.js API Server (Backend)                        │
├─────────────────────────────────────────────────────────────────┤
│  Express.js                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API Endpoints (汎用Wiki編集API)                        │   │
│  │                                                         │   │
│  │  【ファイル操作】                                        │   │
│  │  - GET    /api/files/:filename    (ファイル内容取得)    │   │
│  │  - PUT    /api/files/:filename    (ファイル更新)        │   │
│  │  - GET    /api/files              (ファイル一覧)        │   │
│  │                                                         │   │
│  │  【タスク操作 (todo.md専用)】                           │   │
│  │  - POST   /api/tasks              (タスク追加)          │   │
│  │  - GET    /api/tasks              (タスク一覧)          │   │
│  │  - PATCH  /api/tasks/:id          (タスク更新)          │   │
│  │  - DELETE /api/tasks/:id          (タスク削除)          │   │
│  │  - POST   /api/tasks/:id/complete (完了マーク)          │   │
│  │                                                         │   │
│  │  【セクション操作 (汎用)】                               │   │
│  │  - POST   /api/:file/append       (末尾に追加)          │   │
│  │  - POST   /api/:file/section      (セクション追加)      │   │
│  │  - PATCH  /api/:file/section/:id  (セクション更新)      │   │
│  │                                                         │   │
│  │  【メモ操作 (クイック追加)】                             │   │
│  │  - POST   /api/memo               (クイックメモ)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Services Layer                                         │   │
│  │  - GitHub Service (Octokit)                             │   │
│  │  - Markdown Parser/Writer Service                       │   │
│  │  - Task Manager Service                                 │   │
│  │  - File Manager Service                                 │   │
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

### 1. タスク追加フロー (todo.md)

```
[ユーザー] 
    ↓ タスク入力
[Chrome拡張 UI]
    ↓ { title: "新タスク", priority: "high" }
[POST /api/tasks]
    ↓
[Node.js Backend]
    ├→ GitHub API: GET todo.md
    ├→ Markdown Parser: 解析
    ├→ Task Manager: 新タスク追加
    └→ GitHub API: PUT todo.md (commit: "Add task: 新タスク")
        ↓
[GitHub Repository] → [GitHub Pages]
```

### 2. メモ追加フロー (tenets.md等)

```
[ユーザー]
    ↓ ファイル選択 + 内容入力
[Chrome拡張 UI]
    ↓ { file: "tenets", content: "新しい原則", section: "行動指針" }
[POST /api/tenets/append]
    ↓
[Node.js Backend]
    ├→ GitHub API: GET tenets.md
    ├→ Markdown Parser: 指定セクション特定
    ├→ File Manager: コンテンツ追加
    └→ GitHub API: PUT tenets.md (commit: "Add to tenets: 新しい原則")
        ↓
[GitHub Repository] → [GitHub Pages]
```

### 3. ファイル全体更新フロー

```
[ユーザー]
    ↓ ファイル編集
[Chrome拡張 UI]
    ↓ { file: "strategy.md", content: "更新後の全内容" }
[PUT /api/files/strategy.md]
    ↓
[Node.js Backend]
    ├→ GitHub API: GET strategy.md (SHA取得)
    └→ GitHub API: PUT strategy.md (commit: "Update strategy.md")
        ↓
[GitHub Repository] → [GitHub Pages]
```

### 4. クイックメモフロー

```
[ユーザー]
    ↓ 拡張アイコンクリック → メモ入力
[Chrome拡張 UI]
    ↓ { memo: "思いついたアイデア", target: "todo" }
[POST /api/memo]
    ↓
[Node.js Backend]
    ├→ 対象ファイル決定 (デフォルト: todo.md)
    ├→ タイムスタンプ付与
    └→ GitHub API: PUT (commit: "Quick memo: 思いついた...")
        ↓
[GitHub Repository] → [GitHub Pages]
```

---

## API仕様詳細

### ファイル操作API

#### GET /api/files/:filename
**用途:** ファイル内容の取得
```json
// Request
GET /api/files/tenets.md

// Response
{
  "filename": "tenets.md",
  "content": "# Tenets\n\n...",
  "sha": "abc123...",
  "lastModified": "2025-11-23T12:00:00Z"
}
```

#### PUT /api/files/:filename
**用途:** ファイル全体の更新
```json
// Request
PUT /api/files/strategy.md
{
  "content": "更新後の全内容",
  "message": "Update strategy" // optional
}

// Response
{
  "success": true,
  "commit": "def456...",
  "url": "https://github.com/tsukasa829/docs/commit/def456"
}
```

#### GET /api/files
**用途:** 編集可能なファイル一覧
```json
// Response
{
  "files": [
    { "name": "todo.md", "type": "task" },
    { "name": "tenets.md", "type": "document" },
    { "name": "strategy.md", "type": "document" },
    { "name": "constitution.md", "type": "document" }
  ]
}
```

---

### タスク操作API (todo.md専用)

#### POST /api/tasks
**用途:** タスク追加
```json
// Request
{
  "title": "新しいタスク",
  "priority": "high",  // optional: low/medium/high
  "due": "2025-11-25", // optional
  "tags": ["work"]     // optional
}

// Response
{
  "success": true,
  "taskId": "task-1234",
  "commit": "abc123..."
}
```

#### GET /api/tasks
**用途:** タスク一覧取得
```json
// Response
{
  "tasks": [
    {
      "id": "task-1234",
      "title": "新しいタスク",
      "completed": false,
      "priority": "high",
      "due": "2025-11-25",
      "tags": ["work"]
    }
  ]
}
```

#### PATCH /api/tasks/:id
**用途:** タスク更新
```json
// Request
PATCH /api/tasks/task-1234
{
  "title": "更新されたタスク",  // optional
  "priority": "medium"         // optional
}
```

#### POST /api/tasks/:id/complete
**用途:** タスク完了マーク
```json
// Request
POST /api/tasks/task-1234/complete

// Response
{
  "success": true,
  "taskId": "task-1234",
  "completed": true
}
```

---

### セクション操作API (汎用)

#### POST /api/:file/append
**用途:** ファイル末尾に追加
```json
// Request
POST /api/tenets/append
{
  "content": "新しい行動指針",
  "heading": "### 4. 新原則" // optional
}
```

#### POST /api/:file/section
**用途:** 特定セクションに追加
```json
// Request
POST /api/tenets/section
{
  "sectionTitle": "行動指針",
  "content": "- 新しい項目"
}
```

---

### クイックメモAPI

#### POST /api/memo
**用途:** 素早くメモを追加
```json
// Request
{
  "content": "思いついたアイデア",
  "target": "todo",      // todo/tenets/strategy/constitution
  "timestamp": true      // タイムスタンプ付与
}

// Response
{
  "success": true,
  "addedTo": "todo.md",
  "commit": "xyz789..."
}
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
      "activeTab",
      "contextMenus"  // 右クリックメニュー
    ]
  },
  "技術": [
    "Vanilla JS / React",
    "Chrome Storage API",
    "Fetch API",
    "Context Menus API"
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
│   │   ├── tasks.js           # タスクAPI
│   │   ├── files.js           # ファイル操作API
│   │   ├── memo.js            # クイックメモAPI
│   │   └── sections.js        # セクション操作API
│   ├── /services
│   │   ├── github.js          # GitHub API連携
│   │   ├── markdown.js        # Markdown解析・生成
│   │   ├── taskManager.js     # タスク管理ロジック
│   │   ├── fileManager.js     # ファイル管理ロジック
│   │   └── sectionManager.js  # セクション管理ロジック
│   ├── /middleware
│   │   ├── auth.js            # API認証
│   │   ├── validator.js       # リクエスト検証
│   │   └── errorHandler.js    # エラーハンドリング
│   └── /utils
│       ├── logger.js          # ログ
│       └── helpers.js         # ヘルパー関数
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
