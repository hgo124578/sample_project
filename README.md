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
- `/rrweb-record` - rrweb 記録ページ
- `/rrweb-replay` - rrweb リプレイページ

## rrweb 学習サンプル

このプロジェクトには、rrwebを使った画面操作の記録とリプレイを学習するためのサンプルページが含まれています。

### rrwebとは

rrweb（record and replay the web）は、Webページ上のユーザー操作を記録し、後で正確に再生できるライブラリです。以下のような用途に使用できます：

- セッションリプレイ（ユーザー行動分析）
- バグ再現の記録
- E2Eテストの記録と検証
- ユーザビリティテストの分析

### 使い方

#### 1. 記録ページ（/rrweb-record）

操作の記録を行うページです：

1. ブラウザで `http://localhost:3000/rrweb-record` を開く
2. 「記録開始」ボタンをクリック
3. テストエリアで様々な操作を実行（テキスト入力、クリック、選択など）
4. 「記録停止」ボタンをクリック
5. 「保存 (JSON)」ボタンで記録データをダウンロード

#### 2. リプレイページ（/rrweb-replay）

記録した操作を再生するページです：

1. ブラウザで `http://localhost:3000/rrweb-replay` を開く
2. 「JSONファイルを選択」ボタンをクリック
3. 記録ページで保存したJSONファイルを選択
4. プレイヤーで記録された操作を再生

#### 主な機能

**記録ページ**
- リアルタイムイベント記録
- イベント数のカウント表示
- JSON形式でのエクスポート
- テスト用のインタラクティブな要素

**リプレイページ**
- JSONファイルのインポート
- 再生/一時停止
- 再生速度の調整
- シークバーによる任意位置への移動
- フルスクリーン表示

### 技術詳細

このサンプルでは以下のrrwebの主要機能を学習できます：

1. **rrweb.record()**: ページ上のイベントを記録
   - DOMの変更
   - マウス操作
   - キーボード入力
   - スクロール
   - ウィンドウのリサイズ

2. **rrweb-player**: 記録したイベントの再生
   - 再生コントロール
   - 速度調整
   - タイムライン操作

### 学習のポイント

1. **イベントの構造**: ダウンロードしたJSONを開いて、どのような形式でイベントが記録されているか確認
2. **emit関数**: 記録中にイベントがどのように発生するかを理解
3. **再生の仕組み**: DOMの再構築とイベントの再現がどのように行われるか
4. **実用例**: セッションリプレイツールやバグトラッキングツールへの応用

'use client';

import React, { useRef, useState } from 'react';
import * as rrweb from 'rrweb';
import type { eventWithTime } from '@rrweb/types';

type RecorderStatus = 'idle' | 'recording' | 'stopped';

export default function RrwebRecorder() {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const eventsRef = useRef<eventWithTime[]>([]);
  const stopFnRef = useRef<null | (() => void)>(null);
const stopFnRef = useRef<ReturnType<typeof rrweb.record> | null>(null)
  const startRecording = () => {
    if (status === 'recording') return;

    // 前回分が残っていればクリア（必要なら残す設計にもできます）
    eventsRef.current = [];

    const stop = rrweb.record({
      emit(event) {
        eventsRef.current.push(event as eventWithTime);
      },
      // まずはデフォルトでOK。必要なら sampling や mask 等を後で足す
    });

    stopFnRef.current = stop;
    setStatus('recording');
  };

  const stopRecording = () => {
    if (status !== 'recording') return;

    stopFnRef.current?.();
    stopFnRef.current = null;
    setStatus('stopped');

    // 停止時にJSONとしてダウンロード（まずは保存方法として簡単）
    const data = JSON.stringify(eventsRef.current);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `rrweb-session-${new Date().toISOString()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const clear = () => {
    if (status === 'recording') return;
    eventsRef.current = [];
    setStatus('idle');
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <button onClick={startRecording} disabled={status === 'recording'}>
        開始
      </button>

      <button onClick={stopRecording} disabled={status !== 'recording'}>
        停止
      </button>

      <button onClick={clear} disabled={status === 'recording'}>
        クリア
      </button>

      <span>
        状態: <b>{status}</b> / events: <b>{eventsRef.current.length}</b>
      </span>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Player from 'rrweb-player';
import 'rrweb-player/dist/style.css';

export default function RRWebPlayerPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [events, setEvents] = useState<any[] | null>(null);

  useEffect(() => {
    if (!containerRef.current || !events) return;

    // 前回のプレイヤーを消す（最小のやり方）
    containerRef.current.innerHTML = '';

    new Player({
      target: containerRef.current,
      props: {
        events,
        autoPlay: false,
      },
    });
  }, [events]);

  return (
    <main style={{ padding: 24 }}>
      <h1>rrweb player</h1>

      <input
        type="file"
        accept="application/json"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const text = await file.text();
          setEvents(JSON.parse(text));

          // 同じファイルを再選択できるように
          e.currentTarget.value = '';
        }}
      />

      <div style={{ marginTop: 16 }} ref={containerRef} />
    </main>
  );
}
