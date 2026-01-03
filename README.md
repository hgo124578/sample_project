# Next.js v15 学習用プロジェクト

Next.js v15 を使用したHello World的な基礎学習用Webアプリケーションです。

## 特徴

- Next.js v15 (最新版)
- App Router使用
- Turbopack有効化
- Tailwind CSSによるスタイリング
- 2つのページ（ホーム、アバウト）
- ページ間ナビゲーション

## 使い方

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

### ビルド

```bash
npm run build
```

### 本番サーバーの起動

```bash
npm start
```

## プロジェクト構成

```
sample_project/
├── app/
│   ├── about/
│   │   └── page.js      # アバウトページ
│   ├── globals.css       # グローバルスタイル
│   ├── layout.js         # ルートレイアウト
│   └── page.js           # ホームページ
├── package.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## ページ一覧

- `/` - ホームページ（Hello World）
- `/about` - アバウトページ
