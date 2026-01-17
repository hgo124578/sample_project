const { test, expect, chromium } = require('@playwright/test')

// ============================================================
// 計測設定
// ============================================================
const MEASUREMENT_COUNT = 5

// キャッシュ設定（true: キャッシュ対策を有効化）
const CACHE_CONFIG = {
  // 毎回ブラウザプロセス自体を再起動（最も厳密だが遅い）
  RESTART_BROWSER_PROCESS: true,

  // 毎回新しいブラウザコンテキストを使用（セッションストレージ、Cookie等をリセット）
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
  if (CACHE_CONFIG.DISABLE_HTTP_CACHE) {
    // CDP (Chrome DevTools Protocol) を使用してキャッシュを無効化
    const cdpSession = await context.newCDPSession(page)
    await cdpSession.send('Network.setCacheDisabled', { cacheDisabled: true })
  }

  if (CACHE_CONFIG.DISABLE_SERVICE_WORKER) {
    // Service Workerをバイパス
    await context.route('**/*', (route) => {
      route.continue()
    })
  }

  return page
}

/**
 * 現在のキャッシュ設定をログ出力
 */
function logCacheConfig() {
  const isProductionBuild = process.env.USE_DEV_SERVER !== 'true'

  console.log('\n【サーバー設定】')
  console.log(`  モード: ${isProductionBuild ? '本番ビルド (npm run build && start)' : '開発サーバー (npm run dev)'}`)

  console.log('\n【ブラウザキャッシュ設定】')
  console.log(`  RESTART_BROWSER_PROCESS: ${CACHE_CONFIG.RESTART_BROWSER_PROCESS} (毎回ブラウザ再起動)`)
  console.log(`  USE_FRESH_CONTEXT: ${CACHE_CONFIG.USE_FRESH_CONTEXT} (毎回新しいコンテキスト)`)
  console.log(`  DISABLE_HTTP_CACHE: ${CACHE_CONFIG.DISABLE_HTTP_CACHE} (HTTPキャッシュ無効)`)
  console.log(`  DISABLE_SERVICE_WORKER: ${CACHE_CONFIG.DISABLE_SERVICE_WORKER} (ServiceWorker無効)`)
}

// ============================================================
// テスト
// ============================================================

test.describe('パフォーマンステストページ', () => {
  test('ページの描画時間を5回計測する', async ({ browser }) => {
    // 計測対象の要素
    const elementsToMeasure = [
      { name: 'ヘッダー（h1）', selector: (p) => p.getByRole('heading', { name: 'Performance Test Page' }) },
      { name: 'コントロールパネル', selector: (p) => p.getByText('表示コントロール') },
      { name: 'Canvas パーティクルセクション', selector: (p) => p.getByRole('heading', { name: /Canvas パーティクル/ }) },
      { name: 'CSSアニメーションセクション', selector: (p) => p.getByRole('heading', { name: /CSSアニメーション/ }) },
      { name: '入れ子グリッドセクション', selector: (p) => p.getByRole('heading', { name: /入れ子グリッド/ }) },
      { name: '大量リストセクション', selector: (p) => p.getByRole('heading', { name: /大量リスト/ }) },
      { name: '大量リスト最後のアイテム（#499）', selector: (p) => p.getByText('アイテム #499') },
      { name: 'シャドウ/ブラー要素（24個目）', selector: (p) => p.locator('.aspect-square.rounded-xl').nth(23) },
      { name: 'フッター', selector: (p) => p.getByText('パフォーマンス計測には DevTools の Performance タブを使用してください') },
    ]

    // 各回の計測結果を格納
    const allResults = []

    console.log('\n' + '='.repeat(60))
    console.log('パフォーマンス計測開始（5回繰り返し）')
    console.log('='.repeat(60))
    logCacheConfig()

    // 共有リソース（キャッシュ有効時に使用）
    let sharedBrowser = CACHE_CONFIG.RESTART_BROWSER_PROCESS ? null : browser
    let sharedContext = null
    let sharedPage = null

    if (!CACHE_CONFIG.RESTART_BROWSER_PROCESS && !CACHE_CONFIG.USE_FRESH_CONTEXT) {
      sharedContext = await sharedBrowser.newContext()
      sharedPage = await sharedContext.newPage()
      await setupPage(sharedContext, sharedPage)
    }

    for (let round = 1; round <= MEASUREMENT_COUNT; round++) {
      console.log(`\n[${'*'.repeat(20)} 第${round}回計測 ${'*'.repeat(20)}]`)

      let currentBrowser, context, page

      if (CACHE_CONFIG.RESTART_BROWSER_PROCESS) {
        // 毎回新しいブラウザプロセスを起動（最も厳密）
        currentBrowser = await chromium.launch()
        context = await currentBrowser.newContext()
        page = await context.newPage()
        await setupPage(context, page)
        console.log('  (新しいブラウザプロセスを起動)')
      } else if (CACHE_CONFIG.USE_FRESH_CONTEXT) {
        // 毎回新しいコンテキストを作成
        currentBrowser = sharedBrowser
        context = await currentBrowser.newContext()
        page = await context.newPage()
        await setupPage(context, page)
        console.log('  (新しいブラウザコンテキストを作成)')
      } else {
        // 共有コンテキストを使用
        currentBrowser = sharedBrowser
        context = sharedContext
        page = sharedPage
        if (round > 1) {
          console.log('  (既存のコンテキストを再利用)')
        }
      }

      // 遷移開始時刻を記録
      const startTime = Date.now()

      // パフォーマンステストページにアクセス
      await page.goto('/performance-test', { waitUntil: 'commit' })

      const roundResults = { round, elements: [] }

      // 各要素がvisibleになるまでの時間を計測
      for (const element of elementsToMeasure) {
        try {
          await expect(element.selector(page)).toBeVisible({ timeout: 30000 })
          const duration = Date.now() - startTime

          roundResults.elements.push({
            name: element.name,
            time: duration,
            success: true,
          })

          console.log(`  [${element.name}] ${duration}ms`)
        } catch (error) {
          roundResults.elements.push({
            name: element.name,
            time: -1,
            success: false,
          })
          console.log(`  [${element.name}] タイムアウト`)
        }
      }

      // 最も遅い要素を表示
      const successfulElements = roundResults.elements.filter(e => e.success)
      if (successfulElements.length > 0) {
        const slowest = successfulElements.reduce((prev, curr) => curr.time > prev.time ? curr : prev)
        console.log(`  → 最遅要素: ${slowest.name} (${slowest.time}ms)`)
      }

      allResults.push(roundResults)

      // クリーンアップ
      if (CACHE_CONFIG.RESTART_BROWSER_PROCESS) {
        // ブラウザプロセス自体を終了
        await currentBrowser.close()
      } else if (CACHE_CONFIG.USE_FRESH_CONTEXT) {
        await context.close()
      } else if (round < MEASUREMENT_COUNT) {
        // 共有コンテキストの場合はページをリセット
        await page.goto('about:blank')
        await page.waitForTimeout(500)
      }
    }

    // 共有リソースのクリーンアップ
    if (!CACHE_CONFIG.RESTART_BROWSER_PROCESS && !CACHE_CONFIG.USE_FRESH_CONTEXT && sharedContext) {
      await sharedContext.close()
    }

    // 全体の統計を計算・表示
    console.log('\n' + '='.repeat(60))
    console.log('計測結果サマリー')
    console.log('='.repeat(60))

    // 要素ごとの統計
    console.log('\n【要素別の計測結果】')
    console.log('-'.repeat(60))

    for (const element of elementsToMeasure) {
      const times = allResults
        .map(r => r.elements.find(e => e.name === element.name))
        .filter(e => e && e.success)
        .map(e => e.time)

      if (times.length > 0) {
        const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
        const min = Math.min(...times)
        const max = Math.max(...times)

        console.log(`\n${element.name}:`)
        console.log(`  各回: ${times.map((t, i) => `${i + 1}回目=${t}ms`).join(', ')}`)
        console.log(`  平均: ${avg}ms | 最小: ${min}ms | 最大: ${max}ms`)
      }
    }

    // 最も遅い要素の統計
    console.log('\n' + '-'.repeat(60))
    console.log('【最も遅い要素（各回）】')
    console.log('-'.repeat(60))

    const slowestPerRound = allResults.map(r => {
      const successful = r.elements.filter(e => e.success)
      if (successful.length === 0) return null
      return successful.reduce((prev, curr) => curr.time > prev.time ? curr : prev)
    })

    slowestPerRound.forEach((slowest, index) => {
      if (slowest) {
        console.log(`  第${index + 1}回: ${slowest.name} (${slowest.time}ms)`)
      }
    })

    // 全体で最も遅かった要素
    const allSlowestTimes = slowestPerRound.filter(s => s !== null)
    if (allSlowestTimes.length > 0) {
      const overallSlowest = allSlowestTimes.reduce((prev, curr) => curr.time > prev.time ? curr : prev)
      const avgSlowestTime = Math.round(allSlowestTimes.reduce((a, b) => a + b.time, 0) / allSlowestTimes.length)

      console.log('\n' + '='.repeat(60))
      console.log('【総合結果】')
      console.log('='.repeat(60))
      console.log(`全5回で最も遅かった瞬間: ${overallSlowest.name} (${overallSlowest.time}ms)`)
      console.log(`最遅要素の平均表示時間: ${avgSlowestTime}ms`)
      console.log('='.repeat(60) + '\n')
    }
  })

  test('ホームページからの遷移を5回計測する', async ({ browser }) => {
    console.log('\n' + '='.repeat(60))
    console.log('遷移時間計測開始（5回繰り返し）')
    console.log('='.repeat(60))
    logCacheConfig()

    const results = []

    // 共有リソース
    let sharedBrowser = CACHE_CONFIG.RESTART_BROWSER_PROCESS ? null : browser
    let sharedContext = null
    let sharedPage = null

    if (!CACHE_CONFIG.RESTART_BROWSER_PROCESS && !CACHE_CONFIG.USE_FRESH_CONTEXT) {
      sharedContext = await sharedBrowser.newContext()
      sharedPage = await sharedContext.newPage()
      await setupPage(sharedContext, sharedPage)
    }

    for (let round = 1; round <= MEASUREMENT_COUNT; round++) {
      console.log(`\n[${'*'.repeat(20)} 第${round}回計測 ${'*'.repeat(20)}]`)

      let currentBrowser, context, page

      if (CACHE_CONFIG.RESTART_BROWSER_PROCESS) {
        // 毎回新しいブラウザプロセスを起動
        currentBrowser = await chromium.launch()
        context = await currentBrowser.newContext()
        page = await context.newPage()
        await setupPage(context, page)
        console.log('  (新しいブラウザプロセスを起動)')
      } else if (CACHE_CONFIG.USE_FRESH_CONTEXT) {
        currentBrowser = sharedBrowser
        context = await currentBrowser.newContext()
        page = await context.newPage()
        await setupPage(context, page)
        console.log('  (新しいブラウザコンテキストを作成)')
      } else {
        currentBrowser = sharedBrowser
        context = sharedContext
        page = sharedPage
      }

      // ホームページに移動
      await page.goto('/')
      await expect(page.getByRole('heading', { name: 'Hello World!' })).toBeVisible()

      // 少し待機
      await page.waitForTimeout(300)

      // 遷移開始時刻を記録
      const startTime = Date.now()

      // パフォーマンステストページへのリンクをクリック
      await page.getByRole('link', { name: 'パフォーマンステスト' }).click()

      // URLが変わるまでの時間
      await expect(page).toHaveURL('/performance-test')
      const urlChangeTime = Date.now() - startTime

      // 最も描画が重い要素がvisibleになるまで待機
      await expect(page.getByText('アイテム #499')).toBeVisible({ timeout: 30000 })
      const totalTime = Date.now() - startTime

      results.push({ round, urlChangeTime, totalTime })

      console.log(`  URL変更完了: ${urlChangeTime}ms`)
      console.log(`  最重要素表示完了: ${totalTime}ms`)

      // クリーンアップ
      if (CACHE_CONFIG.RESTART_BROWSER_PROCESS) {
        await currentBrowser.close()
      } else if (CACHE_CONFIG.USE_FRESH_CONTEXT) {
        await context.close()
      } else if (round < MEASUREMENT_COUNT) {
        await page.goto('about:blank')
        await page.waitForTimeout(500)
      }
    }

    // 共有リソースのクリーンアップ
    if (!CACHE_CONFIG.RESTART_BROWSER_PROCESS && !CACHE_CONFIG.USE_FRESH_CONTEXT && sharedContext) {
      await sharedContext.close()
    }

    // 統計を計算
    const urlChangeTimes = results.map(r => r.urlChangeTime)
    const totalTimes = results.map(r => r.totalTime)

    const avgUrlChange = Math.round(urlChangeTimes.reduce((a, b) => a + b, 0) / urlChangeTimes.length)
    const avgTotal = Math.round(totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length)

    console.log('\n' + '='.repeat(60))
    console.log('【遷移時間サマリー】')
    console.log('='.repeat(60))
    console.log('\nURL変更完了時間:')
    console.log(`  各回: ${urlChangeTimes.map((t, i) => `${i + 1}回目=${t}ms`).join(', ')}`)
    console.log(`  平均: ${avgUrlChange}ms | 最小: ${Math.min(...urlChangeTimes)}ms | 最大: ${Math.max(...urlChangeTimes)}ms`)

    console.log('\n最重要素（アイテム #499）表示完了時間:')
    console.log(`  各回: ${totalTimes.map((t, i) => `${i + 1}回目=${t}ms`).join(', ')}`)
    console.log(`  平均: ${avgTotal}ms | 最小: ${Math.min(...totalTimes)}ms | 最大: ${Math.max(...totalTimes)}ms`)
    console.log('='.repeat(60) + '\n')
  })
})
