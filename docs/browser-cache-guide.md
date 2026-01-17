# ブラウザキャッシュとPlaywrightでの制御ガイド

Webアプリケーションのパフォーマンス計測において、キャッシュは計測結果に大きな影響を与えます。
本ドキュメントでは、各種キャッシュの特性と、Playwrightでの制御方法について解説します。

## 目次

1. [キャッシュの種類と概要](#キャッシュの種類と概要)
2. [各キャッシュの詳細](#各キャッシュの詳細)
3. [Playwrightでの制御方法](#playwrightでの制御方法)
4. [実践的なサンプルコード](#実践的なサンプルコード)
5. [計測シナリオ別の推奨設定](#計測シナリオ別の推奨設定)

---

## キャッシュの種類と概要

Webアプリケーションには複数のキャッシュレイヤーが存在します。

| キャッシュの種類 | 場所 | 永続性 | 制御難易度 |
|----------------|------|--------|-----------|
| HTTPキャッシュ | ブラウザ | ディスク/メモリ | 容易 |
| Service Worker | ブラウザ | ディスク | 容易 |
| ブラウザコンテキスト | ブラウザプロセス内 | メモリ | 容易 |
| V8エンジン最適化 | ブラウザプロセス内 | メモリ | 中程度 |
| サーバーサイドキャッシュ | サーバー | メモリ/ディスク | 中程度 |
| OSファイルシステムキャッシュ | OS | メモリ | 困難 |

---

## 各キャッシュの詳細

### 1. HTTPキャッシュ（ブラウザキャッシュ）

**概要**
- JavaScript、CSS、画像などの静的リソースをブラウザがキャッシュ
- `Cache-Control`、`ETag`、`Last-Modified` などのHTTPヘッダーで制御

**特性**
- 2回目以降のページ読み込みが大幅に高速化（3〜4倍）
- ディスクキャッシュとメモリキャッシュの2層構造
- ブラウザを閉じても残る（ディスクキャッシュ）

**影響例**
```
1回目: 445ms（リソースをダウンロード）
2回目: 130ms（キャッシュから読み込み）
```

### 2. Service Worker キャッシュ

**概要**
- PWA（Progressive Web App）で使用されるキャッシュ機構
- JavaScriptで制御可能なプログラマブルキャッシュ

**特性**
- オフライン対応が可能
- 開発者がキャッシュ戦略を細かく制御できる
- ブラウザのHTTPキャッシュとは別に動作

### 3. ブラウザコンテキスト

**概要**
- Cookie、セッションストレージ、ローカルストレージなど
- ブラウザの「シークレットモード」で分離される領域

**特性**
- 同一コンテキスト内でのみ共有
- 認証状態やユーザー設定の保持に使用

### 4. V8エンジン最適化（JITコンパイル）

**概要**
- ChromeのJavaScriptエンジン（V8）による実行時最適化
- 頻繁に実行されるコードを機械語にコンパイル

**特性**
- 同じコードを繰り返し実行すると高速化
- ブラウザプロセス内のメモリに保持
- **ブラウザプロセスを再起動しないと消えない**

**影響例**
```
同一ブラウザプロセス内:
  1回目: 72ms
  2回目: 38ms（JIT最適化済み）

ブラウザプロセス再起動後:
  1回目: 73ms（再度コンパイル）
```

### 5. サーバーサイドキャッシュ（Next.js）

**概要**
- Next.jsの開発サーバー（`npm run dev`）はページをオンデマンドコンパイル
- 一度コンパイルしたページはメモリにキャッシュ

**特性**
- 開発モードで顕著（本番ビルドでは影響小）
- サーバー再起動でリセット

**影響例（開発サーバー）**
```
1回目: 445ms（コンパイル + 配信）
2回目: 130ms（キャッシュから配信）
```

**対策**
- 本番ビルド（`npm run build && npm run start`）で計測

### 6. OSファイルシステムキャッシュ

**概要**
- OSがディスクから読み込んだファイルをメモリにキャッシュ
- アプリケーションからは直接制御不可

**特性**
- ブラウザ再起動でも残る
- OS再起動でリセット
- 実質的に制御不可能

---

## Playwrightでの制御方法

### 制御レベルの比較

| 制御方法 | 消えるキャッシュ | 残るキャッシュ | 速度 |
|---------|----------------|---------------|------|
| 同一コンテキスト再利用 | なし | すべて | 最速 |
| 新規コンテキスト作成 | Cookie, Storage | HTTP, V8 | 速い |
| HTTPキャッシュ無効化 | HTTP | V8, OS | 普通 |
| ブラウザプロセス再起動 | HTTP, V8 | OS | 遅い |

### 1. HTTPキャッシュの無効化

Chrome DevTools Protocol（CDP）を使用してキャッシュを無効化します。

```javascript
async function disableHttpCache(context, page) {
  const cdpSession = await context.newCDPSession(page)
  await cdpSession.send('Network.setCacheDisabled', { cacheDisabled: true })
}
```

### 2. 新規ブラウザコンテキストの作成

```javascript
// 毎回新しいコンテキストを作成
const context = await browser.newContext()
const page = await context.newPage()

// 使用後はクローズ
await context.close()
```

### 3. ブラウザプロセスの再起動

```javascript
const { chromium } = require('@playwright/test')

// 新しいブラウザプロセスを起動
const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

// 使用後はブラウザごとクローズ
await browser.close()
```

### 4. Service Workerのバイパス

```javascript
// すべてのリクエストをそのまま通過させる（Service Workerをバイパス）
await context.route('**/*', (route) => {
  route.continue()
})
```

---

## 実践的なサンプルコード

以下は、キャッシュ設定を切り替え可能なパフォーマンス計測テストの実装例です。

```javascript
const { test, expect, chromium } = require('@playwright/test')

// ============================================================
// キャッシュ設定（true: キャッシュ対策を有効化）
// ============================================================
const CACHE_CONFIG = {
  // 毎回ブラウザプロセス自体を再起動（最も厳密だが遅い）
  RESTART_BROWSER_PROCESS: true,

  // 毎回新しいブラウザコンテキストを使用
  // ※ RESTART_BROWSER_PROCESS が true の場合は自動的に新しいコンテキストになる
  USE_FRESH_CONTEXT: true,

  // ブラウザのHTTPキャッシュを無効化
  DISABLE_HTTP_CACHE: true,

  // Service Workerを無効化（PWAキャッシュ対策）
  DISABLE_SERVICE_WORKER: true,
}

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * キャッシュ設定に基づいてページを準備する
 */
async function setupPage(context, page) {
  // HTTPキャッシュの無効化
  if (CACHE_CONFIG.DISABLE_HTTP_CACHE) {
    const cdpSession = await context.newCDPSession(page)
    await cdpSession.send('Network.setCacheDisabled', { cacheDisabled: true })
  }

  // Service Workerのバイパス
  if (CACHE_CONFIG.DISABLE_SERVICE_WORKER) {
    await context.route('**/*', (route) => {
      route.continue()
    })
  }

  return page
}

// ============================================================
// テスト例
// ============================================================

test('パフォーマンス計測', async ({ browser }) => {
  const MEASUREMENT_COUNT = 5
  const results = []

  for (let round = 1; round <= MEASUREMENT_COUNT; round++) {
    let currentBrowser, context, page

    // --- キャッシュ設定に基づいてブラウザ/コンテキストを準備 ---

    if (CACHE_CONFIG.RESTART_BROWSER_PROCESS) {
      // 最も厳密: 毎回新しいブラウザプロセスを起動
      currentBrowser = await chromium.launch()
      context = await currentBrowser.newContext()
      page = await context.newPage()
      await setupPage(context, page)

    } else if (CACHE_CONFIG.USE_FRESH_CONTEXT) {
      // 中間: 新しいコンテキストを作成（ブラウザプロセスは共有）
      currentBrowser = browser
      context = await currentBrowser.newContext()
      page = await context.newPage()
      await setupPage(context, page)

    } else {
      // キャッシュ有効: 同じコンテキストを再利用
      // （この例では簡略化のため省略）
    }

    // --- 計測 ---

    const startTime = Date.now()
    await page.goto('/target-page')
    await expect(page.locator('#target-element')).toBeVisible()
    const duration = Date.now() - startTime

    results.push({ round, duration })
    console.log(`第${round}回: ${duration}ms`)

    // --- クリーンアップ ---

    if (CACHE_CONFIG.RESTART_BROWSER_PROCESS) {
      await currentBrowser.close()
    } else if (CACHE_CONFIG.USE_FRESH_CONTEXT) {
      await context.close()
    }
  }

  // --- 統計出力 ---

  const times = results.map(r => r.duration)
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
  const min = Math.min(...times)
  const max = Math.max(...times)

  console.log(`平均: ${avg}ms | 最小: ${min}ms | 最大: ${max}ms`)
})
```

### コードの解説

#### 1. CACHE_CONFIG オブジェクト

キャッシュ制御の各オプションをブール値で管理します。これにより、設定の切り替えが容易になります。

```javascript
const CACHE_CONFIG = {
  RESTART_BROWSER_PROCESS: true,  // V8最適化を含むすべてをリセット
  USE_FRESH_CONTEXT: true,        // Cookie, Storageをリセット
  DISABLE_HTTP_CACHE: true,       // HTTP キャッシュを無効化
  DISABLE_SERVICE_WORKER: true,   // PWA キャッシュを無効化
}
```

#### 2. setupPage 関数

ページ作成後に呼び出し、キャッシュ無効化の設定を適用します。

- **CDP（Chrome DevTools Protocol）**: ブラウザの内部APIに直接アクセスし、ネットワークキャッシュを無効化
- **context.route()**: すべてのリクエストをインターセプトし、Service Workerをバイパス

#### 3. ブラウザプロセスの制御

```javascript
// 新規プロセス起動
const browser = await chromium.launch()

// プロセス終了（V8最適化もリセット）
await browser.close()
```

`chromium.launch()` で新しいブラウザプロセスを起動すると、V8エンジンの状態も完全にリセットされます。

---

## 計測シナリオ別の推奨設定

### シナリオ1: 初回訪問ユーザーの体験を計測

すべてのキャッシュを無効化し、最も厳密な条件で計測します。

```javascript
const CACHE_CONFIG = {
  RESTART_BROWSER_PROCESS: true,
  USE_FRESH_CONTEXT: true,
  DISABLE_HTTP_CACHE: true,
  DISABLE_SERVICE_WORKER: true,
}
```

### シナリオ2: リピートユーザーの体験を計測

キャッシュを有効にして、2回目以降のアクセスをシミュレートします。

```javascript
const CACHE_CONFIG = {
  RESTART_BROWSER_PROCESS: false,
  USE_FRESH_CONTEXT: false,
  DISABLE_HTTP_CACHE: false,
  DISABLE_SERVICE_WORKER: false,
}
```

### シナリオ3: 開発中の動作確認（高速）

キャッシュを有効にしつつ、コンテキストは分離します。

```javascript
const CACHE_CONFIG = {
  RESTART_BROWSER_PROCESS: false,
  USE_FRESH_CONTEXT: true,
  DISABLE_HTTP_CACHE: false,
  DISABLE_SERVICE_WORKER: false,
}
```

### シナリオ4: CI/CDでの回帰テスト

安定した結果を得るため、HTTPキャッシュは無効化しますが、速度のためブラウザ再起動は避けます。

```javascript
const CACHE_CONFIG = {
  RESTART_BROWSER_PROCESS: false,
  USE_FRESH_CONTEXT: true,
  DISABLE_HTTP_CACHE: true,
  DISABLE_SERVICE_WORKER: true,
}
```

---

## 注意事項

### 制御できないキャッシュ

以下のキャッシュはアプリケーションレベルでは制御できません：

- **OSファイルシステムキャッシュ**: OS再起動でのみリセット
- **DNSキャッシュ**: OS/ルーターレベルで管理
- **CDNキャッシュ**: サーバー側の設定で制御

### 測定のばらつき

すべてのキャッシュを無効化しても、以下の要因により5〜10%程度のばらつきが発生します：

- CPUの負荷状態
- OSのプロセススケジューリング
- メモリ割り当てのタイミング
- ネットワークの微小な遅延

**複数回計測して平均値を使用することを推奨します。**

---

## 参考リンク

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
