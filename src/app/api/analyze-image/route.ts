import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, recordAnalysisResult } from '@/lib/rateLimit';
import { openai } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-real-ip') ?? '127.0.0.1';
  
  try {
    const ssrClient = await createClient();
    const { data: { user } } = await ssrClient.auth.getUser();

    // 1. レートリミット（クールダウン含む）の事前の確認
    const { allowed, remaining, lockReason } = await checkRateLimit(ip, user?.id);

    if (!allowed) {
      return NextResponse.json(
        { error: lockReason || "本日の利用上限に達しました。" },
        { status: 429 }
      );
    }

    const { base64Image } = await req.json();
    if (!base64Image) {
      return NextResponse.json({ error: "画像データがありません。" }, { status: 400 });
    }

    // 2. OpenAI に投げて画像解析（確信度スコアを要求）
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'あなたはフリマ出品のプロです。画像から商品の特徴を抽出し、必ず以下のJSONスキーマに従って出力してください。\n{\n  "category": "商品の種類（例：アイスティー、ワンピース等）",\n  "brand": "ブランド名（不明な場合は空文字）",\n  "color": "メインカラー（例：ブラウン）",\n  "condition": "状態（例：グラス提供）",\n  "estimated_target_price": 3500,\n  "estimated_postage": 750,\n  "confidence_score": 0.95\n}\n※ estimated_target_price には画像から推測される一般的なフリマアプリでの中古販売相場価格（数値のみ）を、estimated_postage には商品のサイズ感から推測される標準的な送料（例: 薄手なら210、中型なら500、大型なら800など、数値のみ）を入れてください。\n値は全て「日本語」で出力してください。また、解析の確実性を 0.00〜1.00 の confidence_score として必ず含めてください。判断不能な場合は低いスコアを設定してください。'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'この商品の特徴を解析してください。' },
            { type: 'image_url', image_url: { url: base64Image } }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const rawOutput = completion.choices[0]?.message?.content;
    let parsedOutput;
    try {
      parsedOutput = JSON.parse(rawOutput || "{}");
    } catch (e) {
      throw new Error("Invalid JSON response from OpenAI");
    }

    // 3. トランザクション確信度スコア判定（0.70未満は失敗扱い）
    const score = parsedOutput.confidence_score || 0;
    if (score < 0.70) {
      // 失敗時の枠消費ロールバック（枠を減らさず、連続失敗カウントを増やす）
      await recordAnalysisResult(ip, false);
      return NextResponse.json({ 
        error: "もう少し明るい場所で撮影すると、より正確に調律できます。" 
      }, { status: 422 }); // Unprocessable Entity
    }

    // 4. 解析成功：枠消費を確定し、連続失敗カウントをリセット
    await recordAnalysisResult(ip, true);

    return NextResponse.json({ 
      success: true, 
      features: parsedOutput,
      remaining: Math.max(0, remaining - 1) 
    });

  } catch (error: any) {
    console.error("[analyze-image] Error:", error);
    // システムエラーなどの場合もペナルティとして連続失敗をカウントし、枠消費は防ぐ
    await recordAnalysisResult(ip, false);
    return NextResponse.json(
      { error: "画像の解析中にシステムエラーが発生しました。" },
      { status: 500 }
    );
  }
}
