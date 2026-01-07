'use client';

import { useRef, useState } from 'react';
import * as rrweb from 'rrweb';

export default function RrwebRecordPage() {
  const eventsRef = useRef<any[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const stopFnRef = useRef<(() => void) | null>(null);

  const startRecording = () => {
    eventsRef.current = [];
    setEventCount(0);

    const stop = rrweb.record({
      emit(event) {
        eventsRef.current.push(event);
        // カウント更新はしない（パフォーマンスのため）
      },
    });

    stopFnRef.current = stop;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (stopFnRef.current) {
      stopFnRef.current();
      stopFnRef.current = null;
      setIsRecording(false);
      // 停止時にのみカウントを更新
      setEventCount(eventsRef.current.length);
    }
  };

  const saveRecording = () => {
    const dataStr = JSON.stringify(eventsRef.current, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rrweb-recording.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearEvents = () => {
    eventsRef.current = [];
    setEventCount(0);
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">
          rrweb 記録ページ
        </h1>
        <p className="text-gray-600 mb-8">
          画面の操作を記録して、後でリプレイすることができます
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={startRecording}
              disabled={isRecording}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isRecording ? '記録中...' : '記録開始'}
            </button>
            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              記録停止
            </button>
            <button
              onClick={saveRecording}
              disabled={eventCount === 0}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              保存 (JSON)
            </button>
            <button
              onClick={clearEvents}
              disabled={eventCount === 0}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              クリア
            </button>
          </div>

          <div className="text-sm text-gray-600">
            記録されたイベント数: <span className="font-bold text-lg text-indigo-600">
              {isRecording ? '記録中...' : eventCount}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">テストエリア</h2>
          <p className="mb-4 text-gray-600">
            このエリアで色々な操作をして、記録をテストしてみてください：
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                テキスト入力
              </label>
              <input
                type="text"
                placeholder="ここに入力してみてください"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選択肢
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option>オプション 1</option>
                <option>オプション 2</option>
                <option>オプション 3</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700">チェックボックス</span>
              </label>
            </div>

            <div>
              <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                クリック可能なボタン
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                テキストエリア
              </label>
              <textarea
                rows={4}
                placeholder="複数行のテキストを入力できます"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">使い方</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>「記録開始」ボタンをクリックして記録を開始</li>
            <li>テストエリアで色々な操作を行う（入力、クリック、選択など）</li>
            <li>「記録停止」ボタンをクリックして記録を停止</li>
            <li>「保存 (JSON)」ボタンで記録データをダウンロード</li>
            <li>
              <a href="/rrweb-replay" className="text-blue-500 hover:underline">
                リプレイページ
              </a>
              で記録を再生できます
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
