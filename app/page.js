import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-8">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-blue-900">
          Hello World!
        </h1>
        <p className="text-xl text-gray-700">
          Next.js v15 基礎学習用プロジェクトへようこそ
        </p>
        <div className="pt-4 space-y-3">
          <div>
            <Link
              href="/about"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              アバウトページへ →
            </Link>
          </div>
          <div>
            <Link
              href="/demo"
              className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              デモページへ（シャローローティング）→
            </Link>
          </div>
          <div className="pt-4 border-t border-gray-300 mt-6">
            <p className="text-sm text-gray-600 mb-3">rrweb 学習サンプル</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/rrweb-record"
                className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                画面操作を記録
              </Link>
              <Link
                href="/rrweb-replay"
                className="inline-block px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors"
              >
                記録を再生
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
