export type ImageWorkerRequest = {
  file: File;
};

export type ImageWorkerResponse = {
  success: boolean;
  base64?: string;
  error?: string;
  isDegraded?: boolean;
};

self.onmessage = async (e: MessageEvent<ImageWorkerRequest>) => {
  const { file } = e.data;
  const startTime = performance.now();
  let isDegraded = false;

  try {
    // 1. OffscreenCanvas サポートチェック
    if (!('createImageBitmap' in self) || !('OffscreenCanvas' in self)) {
      throw new Error('UNSUPPORTED_BROWSER');
    }

    const bitmap = await createImageBitmap(file);
    
    // 2. リサイズ計算 (長辺最大1024px) トークン防衛
    const MAX_LENGTH = 1024;
    let width = bitmap.width;
    let height = bitmap.height;

    if (width > MAX_LENGTH || height > MAX_LENGTH) {
      if (width > height) {
        height = Math.floor(height * (MAX_LENGTH / width));
        width = MAX_LENGTH;
      } else {
        width = Math.floor(width * (MAX_LENGTH / height));
        height = MAX_LENGTH;
      }
    }

    // 3. 描画
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('CANVAS_ERROR');

    ctx.drawImage(bitmap, 0, 0, width, height);

    // 4. バリデーション（輝度・ヒストグラム解析）
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    let totalBrightness = 0;
    let sampleCount = 0;
    
    // 10ピクセル（RGBA×10=40）間隔でサンプリングし計算量を削減
    for (let i = 0; i < data.length; i += 40) {
      const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      totalBrightness += brightness;
      sampleCount++;
    }
    
    const avgBrightness = totalBrightness / sampleCount;

    // 極端な暗所、白飛びの検出
    if (avgBrightness < 15) {
      throw new Error('TOO_DARK');
    }
    if (avgBrightness > 240) {
      throw new Error('TOO_BRIGHT');
    }

    // 4.2 処理時間の計測による「段階的縮退」の判定
    // 輝度チェックまでで 500ms 以上かかっている場合は、これ以上の解析（エッジ検出等）をスキップ
    if (performance.now() - startTime > 500) {
      isDegraded = true; 
    } else {
      // 余裕がある場合のみラプラシアンフィルタ等の高度なエッジ解析を実行（将来拡張枠）
    }

    // 5. 圧縮（JPEG 0.7）してBase64化
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
    const buffer = await blob.arrayBuffer();
    
    // Uint8Array から Base64 へ変換
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = 'data:image/jpeg;base64,' + btoa(binary);

    bitmap.close();

    self.postMessage({
      success: true,
      base64,
      isDegraded
    } as ImageWorkerResponse);

  } catch (err: any) {
    self.postMessage({
      success: false,
      error: err.message || 'UNKNOWN_ERROR'
    } as ImageWorkerResponse);
  }
};
