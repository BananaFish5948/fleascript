const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = 3001;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUTPUT_DIR = path.join(__dirname, '../public/images/promo');

// 出力ディレクトリの作成
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const { execSync } = require('child_process');

// curl コマンドを内部で同期実行する100%確実な画像取得関数
function downloadSlide(slideNum, destPath, platform = 'x') {
  const url = `${BASE_URL}/api/promo-image?slide=${slideNum}&platform=${platform}`;
  try {
    execSync(`C:\\Windows\\System32\\curl.exe --silent -o "${destPath}" "${url}"`);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

// サーバー起動確認用の簡易GET
function pingServer() {
  return new Promise((resolve) => {
    http.get(`${BASE_URL}/api/roadmap`, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function waitAndGenerate() {
  console.log('--- 開発サーバーの起動待ち... ---');
  let retries = 30; // 最大30秒待つ
  let isServerReady = false;

  while (retries > 0) {
    isServerReady = await pingServer();
    if (isServerReady) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    retries--;
  }

  if (!isServerReady) {
    console.error('エラー: 開発サーバーが起動しませんでした。3001ポートが立ち上がっているか確認してください。');
    process.exit(1);
  }

  console.log('--- サーバー起動確認。画像アセット生成を開始します。 ---');

  // X用スライド (1080x1080)
  console.log('\n=== X (1:1) 用スライド生成 ===');
  for (let i = 1; i <= 4; i++) {
    const outputPath = path.join(OUTPUT_DIR, `slide${i}.png`);
    console.log(`スライド ${i} (X) を生成中...`);
    
    try {
      await downloadSlide(i, outputPath, 'x');
      const stats = fs.statSync(outputPath);
      console.log(`保存成功: public/images/promo/slide${i}.png (${stats.size} bytes)`);
    } catch (err) {
      console.error(`スライド ${i} (X) の生成に失敗しました:`, err.message);
    }

    console.log('--- 冷却中 (2秒待ち)... ---');
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Instagram用スライド (1080x1350)
  console.log('\n=== Instagram (4:5) 用スライド生成 ===');
  for (let i = 1; i <= 4; i++) {
    const outputPath = path.join(OUTPUT_DIR, `insta_slide${i}.png`);
    console.log(`スライド ${i} (Instagram) を生成中...`);
    
    try {
      await downloadSlide(i, outputPath, 'instagram');
      const stats = fs.statSync(outputPath);
      console.log(`保存成功: public/images/promo/insta_slide${i}.png (${stats.size} bytes)`);
    } catch (err) {
      console.error(`スライド ${i} (Instagram) の生成に失敗しました:`, err.message);
    }

    if (i < 4) {
      console.log('--- 冷却中 (2秒待ち)... ---');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log('\n--- すべての画像アセット生成プロセスが完了しました。 ---');
}

waitAndGenerate().catch((err) => {
  console.error('致命的なエラー:', err);
  process.exit(1);
});
