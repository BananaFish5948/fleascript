import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { openai, SYSTEM_PROMPT, buildUserPrompt } from '@/lib/openai';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-real-ip') ?? '127.0.0.1';
  const { allowed, remaining } = await checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "本日の利用上限（3回）に達しました。明日またご利用ください。" },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const inputText = body.inputText;

    if (!inputText || typeof inputText !== 'string' || inputText.trim() === '') {
      return NextResponse.json(
        { error: "商品情報を入力してください。" },
        { status: 400 }
      );
    }

    if (inputText.length > 500) {
      return NextResponse.json(
        { error: "入力は500文字以内にしてください。" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      temperature: 0.7,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(inputText) }
      ]
    });

    const outputText = completion.choices[0]?.message?.content;

    if (!outputText) {
      throw new Error("OpenAI API returned empty response.");
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('generation_logs')
      .insert({
        ip_address: ip,
        input_text: inputText,
        output_text: outputText
      })
      .select('id')
      .maybeSingle();

    if (error) {
      console.error("[generate] Supabase error:", error.message);
      // DBエラー時はログIDをnullにしてレスポンスを返す
      return NextResponse.json({ outputText, logId: null, remaining });
    }

    return NextResponse.json({ outputText, logId: data?.id ?? null, remaining });

  } catch (error: any) {
    console.error("[generate] Error:", error.message);
    return NextResponse.json(
      { error: "AI生成に失敗しました。しばらく時間をおいて再試行してください。" },
      { status: 502 }
    );
  }
}
