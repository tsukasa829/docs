# Wiki Editor Backend

Node.js API server for Wiki Editor Chrome Extension.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` and set your GitHub Personal Access Token:
```
GITHUB_TOKEN=ghp_your_token_here
API_KEY=your_secret_key
```

## Development

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## API Endpoints

See [System Architecture](../docs/system-architecture.md) for full API documentation.

### Health Check
```
GET /
```

### File Operations
```
GET  /api/files/:filename
PUT  /api/files/:filename
GET  /api/files
```

### Task Operations
```
POST   /api/tasks
GET    /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/complete
```

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
