import { NextRequest, NextResponse } from 'next/server';
import { checkBncRateLimit, recordBncAnalysisResult } from '@/lib/rateLimit';
import { openai } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-real-ip') ?? '127.0.0.1';
  
  try {
    const ssrClient = await createClient();
    const { data: { user } } = await ssrClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です。' }, { status: 401 });
    }

    // ユーザーのプラン確認
    const { data: dbUser } = await ssrClient
      .from('users')
      .select('subscription_status')
      .eq('id', user.id)
      .maybeSingle();

    const subscriptionStatus = dbUser?.subscription_status || 'free';
    if (subscriptionStatus !== 'standard' && subscriptionStatus !== 'premium') {
      return NextResponse.json(
        { error: '境界線ヘルパーはスタンダードプラン以上でのみご利用いただけます。' },
        { status: 403 }
      );
    }

    // レートリミット確認
    const { allowed, remaining, lockReason } = await checkBncRateLimit(ip, subscriptionStatus);
    if (!allowed) {
      return NextResponse.json(
        { error: lockReason || '本日の利用上限に達しました。' },
        { status: 429 }
      );
    }

    const { text } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: '解析対象のテキストがありません。' }, { status: 400 });
    }

    // OpenAIで解析
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `あなたはフリマアプリ（メルカリ、ヤフオク、ラクマ等）における顧客間対話のプロフェッショナルかつトラブル回避の専門家です。
ユーザーから提供された「購入者からのメッセージやコメントの書き起こしテキスト」を分析し、取引で発生している事実の要約、トラブルリスクの評価、そしてフリマアプリの利用規約やマナーを考慮した、相手を逆上させず穏やかに境界線を引いて交渉を終了または牽制する「防衛返答（お返事）」を生成してください。

【分析ルール】
1. ノイズ除去: 入力されたテキストに含まれる可能性のあるフリマアプリのUI文字（時間、ボタン名、ヘッダー定型文など）は自動的に無視してください。
2. リスク要因の特定:
   - 「マイルール系要求」（梱包への過度な注文、発送速度の超過要求、独自の値引きルール等）の有無。
   - 「高圧的な態度・文脈」「距離感の崩れ（馴れ馴れしさや失礼な言動）」の有無。
   - 正当なクレーム（商品の不具合など）と、理不尽な要求を区別し、理不尽なマイルール系や高圧的な表現が多い場合はリスクレベルを高く評価してください。

必ず以下のJSONフォーマットに厳格に従って出力してください。キーや構造を変更しないでください。値はすべて「日本語」で出力してください。
{
  "fact": "取引ややり取りの中で起きている客観的な事実の要約（例: 購入者から商品発送の催促と、梱包資材の指定に関する問い合わせが入っている状態。）",
  "riskScore": 85,
  "riskLevel": "high",
  "reason": "リスク評価を下した具体的な理由（例: 発送期日前であるにもかかわらず高圧的な口調で即日発送を要求しており、取引継続時にさらなるクレームに発展する可能性が高いため。）",
  "suggestedResponse": "スマートで穏やかに境界線を引く返答文。フリマ規約を盾にしつつ、逆上を防ぐ丁寧な文面（例: お問い合わせありがとうございます。発送につきましては、商品ページに記載の通り「2〜3日以内」を予定しております。ご希望に沿えず恐縮ですが、順次発送手続きを進めておりますので、今しばらくお待ちいただけますと幸いです。よろしくお願い申し上げます。）"
}
有効なJSONオブジェクトのみを出力し、マークダウン等を含めないでください。`
        },
        {
          role: 'user',
          content: `以下のテキストを解析してください：\n${text}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const rawOutput = completion.choices[0]?.message?.content;
    let parsedOutput;
    try {
      parsedOutput = JSON.parse(rawOutput || '{}');
    } catch (e) {
      throw new Error('Invalid JSON response from OpenAI');
    }

    // 解析成功：BNCの利用回数を記録
    await recordBncAnalysisResult(ip);

    return NextResponse.json({
      success: true,
      analysis: parsedOutput,
      remaining: Math.max(0, remaining - 1)
    });

  } catch (error: any) {
    console.error('[analyze-chat] Error:', error);
    return NextResponse.json(
      { error: '対話データの解析中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
