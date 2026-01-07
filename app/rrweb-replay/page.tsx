'use client';

import { useEffect, useRef, useState } from 'react';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';

export default function RrwebReplayPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedEvents = JSON.parse(content);
        setEvents(parsedEvents);
        setIsLoaded(true);
      } catch (error) {
        alert('JSONファイルの読み込みに失敗しました');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (events.length > 0 && playerContainerRef.current && isLoaded) {
      // 既存のプレイヤーをクリーンアップ
      if (playerRef.current) {
        playerContainerRef.current.innerHTML = '';
      }

      // 新しいプレイヤーを作成
      playerRef.current = new rrwebPlayer({
        target: playerContainerRef.current,
        props: {
          events,
          width: 1024,
          height: 576,
          autoPlay: false,
        },
      });
    }

    return () => {
      if (playerRef.current && playerContainerRef.current) {
        playerContainerRef.current.innerHTML = '';
      }
    };
  }, [events, isLoaded]);

  const clearPlayer = () => {
    setEvents([]);
    setIsLoaded(false);
    if (playerContainerRef.current) {
      playerContainerRef.current.innerHTML = '';
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">
          rrweb リプレイページ
        </h1>
        <p className="text-gray-600 mb-8">
          記録した操作を再生します
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4 items-center mb-4">
            <label className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 cursor-pointer transition-colors">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              JSONファイルを選択
            </label>
            {isLoaded && (
              <button
                onClick={clearPlayer}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                クリア
              </button>
            )}
            <span className="text-sm text-gray-600">
              {isLoaded ? `${events.length} イベント読み込み済み` : 'ファイルが選択されていません'}
            </span>
          </div>

          {!isLoaded && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                💡
                <a
                  href="/rrweb-record"
                  className="text-blue-500 hover:underline ml-1"
                >
                  記録ページ
                </a>
                で保存したJSONファイルをアップロードしてください
              </p>
            </div>
          )}
        </div>

        {isLoaded && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">プレイヤー</h2>
            <div
              ref={playerContainerRef}
              className="flex justify-center"
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">使い方</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <a href="/rrweb-record" className="text-blue-500 hover:underline">
                記録ページ
              </a>
              で操作を記録してJSONファイルをダウンロード
            </li>
            <li>「JSONファイルを選択」ボタンをクリックしてファイルを読み込む</li>
            <li>プレイヤーの再生ボタンで記録された操作を再生</li>
            <li>再生速度の調整や一時停止も可能</li>
          </ol>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">プレイヤーの操作</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>再生/一時停止: 中央の再生ボタン</li>
              <li>速度調整: 右側の速度選択メニュー</li>
              <li>シークバー: 下部のバーをドラッグして任意の位置に移動</li>
              <li>フルスクリーン: 右上のフルスクリーンボタン</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
