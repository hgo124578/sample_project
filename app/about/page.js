import Link from 'next/link'

export default function About() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-8">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-green-900">
          アバウトページ
        </h1>
        <p className="text-xl text-gray-700">
          これはNext.js v15のApp Routerを使用した2つ目のページです
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">このプロジェクトについて</h2>
          <ul className="text-left space-y-2 text-gray-600">
            <li>✓ Next.js v15使用</li>
            <li>✓ App Router採用</li>
            <li>✓ Tailwind CSSでスタイリング</li>
            <li>✓ 2つのページ構成</li>
          </ul>
        </div>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </main>
  )
}
