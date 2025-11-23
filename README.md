# Wiki Editor Development

このリポジトリは3つのコンポーネントで構成されています。

## 📁 ディレクトリ構成

```
/
├── docs/                      # GitHub Pages Wiki
│   ├── index.md
│   ├── todo.md
│   ├── tenets.md
│   ├── strategy.md
│   ├── constitution.md
│   └── system-architecture.md
│
├── backend/                   # Node.js API Server
│   ├── package.json
│   ├── .env.example
│   ├── server.js
│   ├── vercel.json
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── utils/
│
├── extension/                 # Chrome Extension
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── background.js
│   ├── styles.css
│   └── icons/
│
├── .gitignore
├── README.md
└── _config.yml
```

## 🚀 セットアップ

### Backend (Node.js API)
```bash
cd backend
npm install
cp .env.example .env
# .envファイルを編集してGitHub PATを設定
npm run dev
```

### Chrome Extension
```bash
# Chrome: chrome://extensions/
# 「パッケージ化されていない拡張機能を読み込む」
# extensionフォルダを選択
```

### Wiki (GitHub Pages)
```bash
# docsフォルダのMarkdownを編集
git add docs/
git commit -m "Update wiki"
git push
```

## 🔧 開発コマンド

**Backend:**
```bash
npm run dev      # 開発モード
npm start        # 本番モード
npm test         # テスト実行
```

**Extension:**
- Chrome拡張管理画面で更新ボタンをクリック

## 📝 関連ドキュメント

- [システム構成図](docs/system-architecture.md)
- Wiki: https://tsukasa829.github.io/docs/

## 🌐 デプロイ

- **Wiki**: GitHub Pages (自動)
- **Backend**: Vercel
- **Extension**: Chrome Web Store

---

最終更新: 2025年11月23日
