'use client';

import { useRef, useState } from 'react';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';

/**
 * rrwebPlayer の最小サンプル
 *
 * rrwebPlayerの基本的な使い方：
 *
 * new rrwebPlayer({
 *   target: HTMLElement,  // プレイヤーを表示するDOM要素
 *   props: {
 *     events: Event[],    // 記録されたイベントの配列
 *     width: number,      // プレイヤーの幅
 *     height: number,     // プレイヤーの高さ
 *   }
 * });
 */
export default function RrwebSimplePage() {
  const playerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('JSONファイルを読み込んでください');

  // ファイル読み込み → プレイヤー作成
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const events = JSON.parse(e.target?.result as string);

      // 既存のプレイヤーをクリア
      if (playerRef.current) {
        playerRef.current.innerHTML = '';
      }

      // rrwebPlayer の作成（これが核心部分）
      new rrwebPlayer({
        target: playerRef.current!,
        props: {
          events: events,
          width: 800,
          height: 450,
        },
      });

      setStatus(`${events.length} イベントを読み込みました`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">rrwebPlayer シンプルサンプル</h1>

      <div className="mb-4">
        <input type="file" accept=".json" onChange={handleFile} />
        <p className="text-gray-600 mt-2">{status}</p>
      </div>

      {/* プレイヤーがここに表示される */}
      <div ref={playerRef} />

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">コード解説</h2>
        <pre className="text-sm overflow-x-auto">{`
// 1. インポート
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';

// 2. プレイヤーを表示するDOM要素を用意
const playerRef = useRef<HTMLDivElement>(null);

// 3. rrwebPlayer を new で作成
new rrwebPlayer({
  target: playerRef.current,  // 表示先のDOM要素
  props: {
    events: events,           // イベント配列（JSONから読み込んだもの）
    width: 800,               // 幅
    height: 450,              // 高さ
  },
});
        `}</pre>
      </div>

      <div className="mt-4">
        <a href="/rrweb-record" className="text-blue-500 hover:underline">
          ← 記録ページで操作を記録する
        </a>
      </div>
    </div>
  );
}
