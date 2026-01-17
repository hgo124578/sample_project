'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// 大量のアイテムを生成
const ITEM_COUNT = 500
const PARTICLE_COUNT = 200
const ANIMATED_BOX_COUNT = 50

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
}

export default function PerformanceTestPage() {
  const [items, setItems] = useState<number[]>([])
  const [counter, setCounter] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const [showHeavyList, setShowHeavyList] = useState(true)
  const [showCanvas, setShowCanvas] = useState(true)
  const [showCSSAnimations, setShowCSSAnimations] = useState(true)
  const [showNestedGrid, setShowNestedGrid] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number | null>(null)

  // 大量のアイテムを初期化
  useEffect(() => {
    setItems(Array.from({ length: ITEM_COUNT }, (_, i) => i))
  }, [])

  // Canvas パーティクルアニメーション
  const initParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: Math.random() * 5 + 2,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    }))
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !isAnimating) return

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    particlesRef.current.forEach((particle) => {
      // 位置更新
      particle.x += particle.vx
      particle.y += particle.vy

      // 壁で跳ね返り
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

      // 描画
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fillStyle = particle.color
      ctx.fill()

      // 近いパーティクル同士を線で結ぶ（重い処理）
      particlesRef.current.forEach((other) => {
        const dx = particle.x - other.x
        const dy = particle.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 80) {
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(other.x, other.y)
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 80})`
          ctx.stroke()
        }
      })
    })

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [isAnimating])

  useEffect(() => {
    if (showCanvas) {
      initParticles()
      if (isAnimating) {
        animate()
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [showCanvas, isAnimating, initParticles, animate])

  // 頻繁な状態更新（再レンダリングを誘発）
  useEffect(() => {
    if (!isAnimating) return
    const interval = setInterval(() => {
      setCounter((c) => c + 1)
    }, 100)
    return () => clearInterval(interval)
  }, [isAnimating])

  // 複雑な計算を含むレンダリング
  const calculateComplexValue = (index: number) => {
    let result = 0
    for (let i = 0; i < 100; i++) {
      result += Math.sin(index * i) * Math.cos(index + i)
    }
    return result.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">
      {/* ヘッダー */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
            Performance Test Page
          </h1>
          <Link
            href="/"
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
        <p className="text-gray-400 mt-2">
          描画が重い要素を含むパフォーマンステスト用ページ
        </p>
        <div className="mt-2 text-sm text-cyan-400">
          カウンター: {counter} (100ms毎に更新)
        </div>
      </header>

      {/* コントロールパネル */}
      <div className="mb-6 p-4 bg-white/5 rounded-xl backdrop-blur-sm">
        <h2 className="text-lg font-semibold mb-3">表示コントロール</h2>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnimating}
              onChange={(e) => setIsAnimating(e.target.checked)}
              className="w-4 h-4"
            />
            アニメーション実行
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHeavyList}
              onChange={(e) => setShowHeavyList(e.target.checked)}
              className="w-4 h-4"
            />
            大量リスト ({ITEM_COUNT}件)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCanvas}
              onChange={(e) => setShowCanvas(e.target.checked)}
              className="w-4 h-4"
            />
            Canvas パーティクル ({PARTICLE_COUNT}個)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCSSAnimations}
              onChange={(e) => setShowCSSAnimations(e.target.checked)}
              className="w-4 h-4"
            />
            CSSアニメーション ({ANIMATED_BOX_COUNT}個)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showNestedGrid}
              onChange={(e) => setShowNestedGrid(e.target.checked)}
              className="w-4 h-4"
            />
            入れ子グリッド
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canvas パーティクルアニメーション */}
        {showCanvas && (
          <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-3 text-purple-300">
              Canvas パーティクル ({PARTICLE_COUNT}個 + 接続線)
            </h2>
            <canvas
              ref={canvasRef}
              width={500}
              height={300}
              className="w-full rounded-lg bg-black"
            />
          </div>
        )}

        {/* CSSアニメーション */}
        {showCSSAnimations && (
          <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm overflow-hidden">
            <h2 className="text-lg font-semibold mb-3 text-pink-300">
              CSSアニメーション ({ANIMATED_BOX_COUNT}個)
            </h2>
            <div className="relative h-[300px] overflow-hidden">
              {Array.from({ length: ANIMATED_BOX_COUNT }, (_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full opacity-70"
                  style={{
                    width: `${20 + (i % 5) * 10}px`,
                    height: `${20 + (i % 5) * 10}px`,
                    left: `${(i * 37) % 90}%`,
                    top: `${(i * 23) % 80}%`,
                    background: `linear-gradient(${i * 30}deg,
                      hsl(${(i * 20) % 360}, 80%, 60%),
                      hsl(${(i * 20 + 60) % 360}, 80%, 60%))`,
                    animation: `
                      float-${i % 3} ${2 + (i % 3)}s ease-in-out infinite,
                      pulse ${1 + (i % 2)}s ease-in-out infinite,
                      rotate ${3 + (i % 4)}s linear infinite
                    `,
                    boxShadow: `0 0 ${10 + (i % 5) * 5}px hsl(${(i * 20) % 360}, 80%, 60%)`,
                  }}
                />
              ))}
            </div>
            <style jsx>{`
              @keyframes float-0 {
                0%, 100% { transform: translateY(0) translateX(0); }
                50% { transform: translateY(-30px) translateX(10px); }
              }
              @keyframes float-1 {
                0%, 100% { transform: translateY(0) translateX(0); }
                50% { transform: translateY(-20px) translateX(-15px); }
              }
              @keyframes float-2 {
                0%, 100% { transform: translateY(0) translateX(0); }
                50% { transform: translateY(-40px) translateX(5px); }
              }
              @keyframes pulse {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
              }
              @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* 入れ子グリッドレイアウト */}
        {showNestedGrid && (
          <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-3 text-cyan-300">
              入れ子グリッド (4層)
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className="bg-white/5 p-2 rounded">
                  <div className="grid grid-cols-2 gap-1">
                    {Array.from({ length: 4 }, (_, j) => (
                      <div key={j} className="bg-white/10 p-1 rounded">
                        <div className="grid grid-cols-2 gap-0.5">
                          {Array.from({ length: 4 }, (_, k) => (
                            <div
                              key={k}
                              className="h-3 rounded-sm transition-all duration-300 hover:scale-150"
                              style={{
                                backgroundColor: `hsl(${(i * 20 + j * 40 + k * 60 + counter) % 360}, 70%, 50%)`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 大量のリストアイテム */}
        {showHeavyList && (
          <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-3 text-yellow-300">
              大量リスト ({ITEM_COUNT}件、仮想化なし)
            </h2>
            <div className="h-[300px] overflow-auto">
              {items.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-2 mb-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                  style={{
                    borderLeft: `4px solid hsl(${(item * 3 + counter) % 360}, 70%, 50%)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: `linear-gradient(135deg,
                          hsl(${(item * 5) % 360}, 70%, 50%),
                          hsl(${(item * 5 + 60) % 360}, 70%, 50%))`,
                      }}
                    >
                      {item}
                    </div>
                    <div>
                      <div className="font-medium">アイテム #{item}</div>
                      <div className="text-xs text-gray-400">
                        計算値: {calculateComplexValue(item + counter)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: `hsl(${(item * 10 + i * 30) % 360}, 70%, 50%)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 追加の重い要素：シャドウとブラー */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl backdrop-blur-md transition-all duration-500 hover:scale-110 cursor-pointer"
            style={{
              background: `linear-gradient(${i * 15 + counter}deg,
                hsl(${(i * 15 + counter) % 360}, 70%, 50%),
                hsl(${(i * 15 + 60 + counter) % 360}, 70%, 50%))`,
              boxShadow: `
                0 0 20px hsl(${(i * 15 + counter) % 360}, 70%, 50%),
                0 0 40px hsl(${(i * 15 + counter) % 360}, 70%, 30%),
                inset 0 0 20px rgba(255,255,255,0.2)
              `,
            }}
          />
        ))}
      </div>

      {/* フッター */}
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>パフォーマンス計測には DevTools の Performance タブを使用してください</p>
      </footer>
    </div>
  )
}
