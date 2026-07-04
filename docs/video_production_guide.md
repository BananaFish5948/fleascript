# FleaScript プロモーション動画 制作マニュアル（合成手法）

動画生成AIの弱点である「日本語の文字化け（宇宙文字）」を完全に回避し、シネマティックな実写映像とFleaScriptの正確なUIを融合させるための具体的な手順書です。

---

## 🗺️ 全体フロー（概要）
AIに「文字（UI）」を描かせるのではなく、AIには「無地のスマホ画面」を持つ実写風の背景動画だけを生成させます。
その後、無料の動画編集アプリ（CapCutなど）を使って、「本物のFleaScriptの画面録画」をスマホの枠にはめ込み合成します。

---

## Step 1: AIによる素材動画の生成（Image-to-Video手法の推奨）
シーンごとにテキストだけで生成すると、カフェの机の色や光の質感が変わり、繋げた時に違和感（不自然なカット割り）が生まれるリスクがあります。
これを防ぐため、まずは画像生成AI（MidjourneyやChatGPTのDALL-E 3など）で**「基準となる1枚の静止画（カフェのテーブルと手）」**を生成し、その画像をLumaやDeeVid AIに読み込ませて動かす**「画像からの動画生成（Image-to-Video）」**を行うのがプロの鉄則です。

以下の**専用の英語プロンプト**を用いて、まずは基準となる画像を生成し、それを動画化してください。※日本語の企画書は入力しないでください。

### 🎬 シーン1用（カフェの静寂）
`Cinematic close-up. A person's hand gently placing a glass of iced tea with ice cubes on a wooden table in an aesthetic cafe. Soft natural sunlight filtering through a window. Realism, shallow depth of field, 4k, photorealistic.`

### 🎬 シーン2＆3用（スマホ操作の背景）
`Cinematic close-up, over-the-shoulder view. A person's hand holding a modern smartphone in a bright aesthetic cafe. The person taps the screen once. The smartphone screen is a completely blank solid color with absolutely no text, no letters, no typography, and no UI elements. Soft natural light, 4k, photorealistic.`
> 💡 **Point**: 意図的に「Absolutely no text（文字を絶対に出すな）」と命令し、空っぽのスマホ画面を生成させます。

### 🎬 シーン4用（ロゴ用背景）
`A clean, soft pastel color gradient background. Minimalist and aesthetic. Gentle, slow abstract motion. No text, absolutely blank. 4k.`

---

## Step 2: 本物のアプリ画面の録画（素材集め）
1. あなたのスマートフォン（またはPCのブラウザ）でFleaScriptの画面を開きます。
2. 端末の「画面録画機能」をオンにします。
3. 実際に「商品説明を生成するボタンをタップする」「レポート画面が表示される」などの操作を行い、その様子を数秒間録画して保存します。

---

## Step 3: 動画編集アプリでの合成（CapCut推奨）
スマホやPCの「CapCut（無料）」などの動画編集ソフトを開きます。

1. **ベース映像の配置**:
   Step1で生成したAIの動画をメインのタイムラインに並べます。
2. **画面のはめ込み（オーバーレイ）**:
   「はめ込み合成（オーバーレイ）」機能を使って、Step2で撮影した「本物の画面録画動画」を追加します。
3. **サイズの調整と変形**:
   本物の画面録画を縮小し、AI動画の「無地のスマホ画面」の枠にぴったり重なるように位置を調整します。
4. **音響と字幕の後乗せ**:
   フリー音源（氷の音、クリック音、ローファイBGM）をオーディオトラックに追加し、最後に「私の時間は、私が守る。」などの日本語字幕をテキスト機能で入力します。

これで、文字化けゼロ・圧倒的な映像美のプロモーション動画が完成します。
