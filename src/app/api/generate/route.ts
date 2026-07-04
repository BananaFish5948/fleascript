import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { openai, buildSystemPrompt, buildUserPrompt } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-real-ip') ?? '127.0.0.1';
  const isDevMode = req.cookies.has('FLEA_DEV_MODE');

  try {
    const body = await req.json();
    const { inputText, deviceId, pageLoadId } = body;

    const ssrClient = await createClient();
    const { data: { user } } = await ssrClient.auth.getUser();

    const { allowed, remaining, isPremium, lockReason } = await checkRateLimit(ip, user?.id);

    if (!allowed) {
      return NextResponse.json(
        { error: lockReason || "本日の利用上限に達しました。", limitReached: true },
        { status: 429 }
      );
    }

    if (!inputText || typeof inputText !== 'string' || inputText.trim() === '') {
      return NextResponse.json(
        { error: "商品情報を入力してください。" },
        { status: 400 }
      );
    }

    const maxLength = isPremium ? 1500 : 300;
    if (inputText.length > maxLength) {
      return NextResponse.json(
        { error: `入力は${maxLength}文字以内にしてください。` },
        { status: 400 }
      );
    }

    // 簡易インジェクション検知
    if (inputText.match(/指示を無視|プロンプト|ignore previous|system prompt/i)) {
      return NextResponse.json(
        { error: "不正な入力が検出されました。" },
        { status: 400 }
      );
    }

    // ユーザー設定から seller_rules と customSignature を取得
    let sellerRules = '';
    let customSignature = '';
    if (user) {
      const { data: dbUser } = await ssrClient
        .from('users')
        .select('preferences')
        .eq('id', user.id)
        .maybeSingle();
      if (dbUser?.preferences?.seller_rules) {
        sellerRules = dbUser.preferences.seller_rules;
      }
      if (dbUser?.preferences?.customSignature) {
        customSignature = dbUser.preferences.customSignature;
      }
    }

    const systemPrompt = buildSystemPrompt(sellerRules);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1500, // 3プラットフォーム分なので少し多めに確保
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: buildUserPrompt(inputText) }
      ]
    }, {
      timeout: 20000 // JSON出力で少し時間がかかる可能性があるため20秒に延長
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) {
      throw new Error("OpenAI API returned empty response.");
    }

    let parsedOutput;
    try {
      parsedOutput = JSON.parse(rawOutput);
    } catch (e) {
      console.error("JSON Parse Error:", rawOutput);
      throw new Error("Failed to parse JSON response from OpenAI.");
    }

    if (!isPremium) {
      const footerTexts = [
        '\n\n（商品説明最適化ツール「FleaScript」: https://fleascript.vercel.app ）',
        '\n\n（出品タイパ向上ツール FleaScript にて作成 👉 https://fleascript.vercel.app ）',
        '\n\n（フリマ出品をラクにする「FleaScript」で自動生成: https://fleascript.vercel.app ）'
      ];
      
      ['mercari', 'yahoo', 'rakuma'].forEach(platform => {
        if (parsedOutput[platform]) {
          parsedOutput[platform] += footerTexts[Math.floor(Math.random() * footerTexts.length)];
        }
      });
    } else if (customSignature) {
      ['mercari', 'yahoo', 'rakuma'].forEach(platform => {
        if (parsedOutput[platform]) {
          parsedOutput[platform] += '\n\n' + customSignature;
        }
      });
    }

    return NextResponse.json({ outputData: parsedOutput, logId: null, remaining, isPremium });

  } catch (error: any) {
    console.error("[generate] Error:", error?.message || error);

    if (error?.name === 'APITimeoutError') {
      return NextResponse.json(
        { error: "AIサーバーが混み合っています。少し時間をおいて再度お試しください。" },
        { status: 504 }
      );
    }

    if (error?.status === 429 || error?.code === 'insufficient_quota') {
      const errorMessage = isDevMode 
        ? `[DevMode] Quota Exceeded (429): ${error?.message || 'insufficient_quota'}`
        : "現在、アクセスが集中しており商品説明の生成を一時停止しています。しばらく経ってから再度お試しください。";
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "AI生成に失敗しました。しばらく時間をおいて再試行してください。" },
      { status: 502 }
    );
  }
}
