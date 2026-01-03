'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function Demo() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [count, setCount] = useState(0)

  const currentColor = searchParams.get('color') || 'blue'
  const currentTab = searchParams.get('tab') || 'info'

  const changeColor = (color) => {
    // URLのcolorパラメータだけを変更（シャローローティング的な動作）
    const params = new URLSearchParams(searchParams)
    params.set('color', color)
    router.push(`/demo?${params.toString()}`)
  }

  const changeTab = (tab) => {
    // URLのtabパラメータだけを変更
    const params = new URLSearchParams(searchParams)
    params.set('tab', tab)
    router.push(`/demo?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-900 mb-2">
          シャローローティング デモ
        </h1>
        <p className="text-gray-600 mb-8">
          URLパラメータを変更してもページは再読み込みされません
        </p>

        {/* カウンターセクション */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            カウンター（状態の保持デモ）
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-purple-600">{count}</span>
            <button
              onClick={() => setCount(count + 1)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              +1
            </button>
            <button
              onClick={() => setCount(0)}
              className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              リセット
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            ※下の色やタブを変更してもカウンターの値は保持されます
          </p>
        </div>

        {/* カラー選択セクション */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            カラー選択
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            現在のURL: <code className="bg-gray-100 px-2 py-1 rounded">/demo?color={currentColor}&tab={currentTab}</code>
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => changeColor('red')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                currentColor === 'red'
                  ? 'bg-red-500 text-white scale-105 shadow-lg'
                  : 'bg-red-200 text-red-800 hover:bg-red-300'
              }`}
            >
              赤
            </button>
            <button
              onClick={() => changeColor('green')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                currentColor === 'green'
                  ? 'bg-green-500 text-white scale-105 shadow-lg'
                  : 'bg-green-200 text-green-800 hover:bg-green-300'
              }`}
            >
              緑
            </button>
            <button
              onClick={() => changeColor('blue')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                currentColor === 'blue'
                  ? 'bg-blue-500 text-white scale-105 shadow-lg'
                  : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
              }`}
            >
              青
            </button>
          </div>
        </div>

        {/* タブ切り替えセクション */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            タブ切り替え
          </h2>
          <div className="flex gap-2 mb-4 border-b">
            <button
              onClick={() => changeTab('info')}
              className={`px-4 py-2 font-semibold transition-colors ${
                currentTab === 'info'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              情報
            </button>
            <button
              onClick={() => changeTab('settings')}
              className={`px-4 py-2 font-semibold transition-colors ${
                currentTab === 'settings'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              設定
            </button>
            <button
              onClick={() => changeTab('history')}
              className={`px-4 py-2 font-semibold transition-colors ${
                currentTab === 'history'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              履歴
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            {currentTab === 'info' && (
              <div>
                <h3 className="font-semibold text-lg mb-2">情報タブ</h3>
                <p className="text-gray-600">
                  これはシャローローティングのデモです。タブを切り替えてもページは再読み込みされず、URLだけが変更されます。
                </p>
              </div>
            )}
            {currentTab === 'settings' && (
              <div>
                <h3 className="font-semibold text-lg mb-2">設定タブ</h3>
                <p className="text-gray-600">
                  URLに ?tab=settings が追加されました。このURLを共有すれば、他の人も同じタブを開くことができます。
                </p>
              </div>
            )}
            {currentTab === 'history' && (
              <div>
                <h3 className="font-semibold text-lg mb-2">履歴タブ</h3>
                <p className="text-gray-600">
                  ブラウザの「戻る」ボタンを押すと、前のタブに戻ります。これはURLが履歴に保存されているためです。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 説明セクション */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">試してみよう！</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>カウンターを増やしてください</li>
            <li>色やタブを変更してください</li>
            <li>URLが変わることを確認してください</li>
            <li>カウンターの値が保持されていることを確認してください</li>
            <li>ブラウザの「戻る」ボタンで前の状態に戻れることを確認してください</li>
          </ol>
        </div>

        {/* ナビゲーション */}
        <div className="flex gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            ← ホームに戻る
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            アバウトページへ →
          </Link>
        </div>
      </div>
    </div>
  )
}
