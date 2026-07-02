import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { openai, buildSystemPrompt, buildUserPrompt, PlatformType } from '@/lib/openai';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-real-ip') ?? '127.0.0.1';

  try {
    const body = await req.json();
    const { inputText, deviceId, platform = 'mercari' } = body;

    const ssrClient = await createClient();
    const { data: { user } } = await ssrClient.auth.getUser();

    const isDevMode = req.cookies.has('FLEA_DEV_MODE');
    const { allowed, remaining, isPremium } = await checkRateLimit(ip, deviceId, isDevMode, user?.id);

    if (!allowed) {
      return NextResponse.json(
        { error: "本日の利用上限に達しました。", limitReached: true },
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

    const systemPrompt = buildSystemPrompt(platform as PlatformType);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: buildUserPrompt(inputText) }
      ]
    }, {
      timeout: 15000 // 15秒でタイムアウトさせる
    });

    let outputText = completion.choices[0]?.message?.content;

    if (!outputText) {
      throw new Error("OpenAI API returned empty response.");
    }

    if (!isPremium) {
      outputText += '\n\n【FleaScript無料版で自動作成】フリマ出品を1秒でラクにする無料ツールはこちら(https://fleascript.vercel.app)';
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('generation_logs')
      .insert({
        user_id: user?.id || deviceId || null,
        ip_address: ip,
        input_text: inputText,
        output_text: outputText,
        platform: platform
      })
      .select('id')
      .maybeSingle();

    if (error) {
      console.error("[generate] Supabase error:", error.message);
      return NextResponse.json({ outputText, logId: null, remaining, isPremium });
    }

    return NextResponse.json({ outputText, logId: data?.id ?? null, remaining, isPremium });

  } catch (error: any) {
    console.error("[generate] Error:", error?.message || error);

    if (error?.name === 'APITimeoutError') {
      return NextResponse.json(
        { error: "AIサーバーが混み合っています。少し時間をおいて再度お試しください。" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "AI生成に失敗しました。しばらく時間をおいて再試行してください。" },
      { status: 502 }
    );
  }
}
