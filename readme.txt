============================================================
  FC Portal — 使用説明書
  Final Fantasy XIV フリーカンパニーサイト
  Bootstrap 5.3 + FF14モダンテーマ
============================================================

■ ファイル構成
----------------------------------------------------------
fc-site/
├── index.html              ← ホームページ
├── readme.txt              ← この説明書
│
├── HTML/                   ← 各ページのHTMLファイル
│   ├── _nav.html           ← ナビスニペット（参考用）
│   ├── members.html        ← メンバー一覧
│   ├── rules.html          ← FCルール
│   ├── discord.html        ← Discord案内
│   ├── links.html          ← リンク集（JSONカード）
│   ├── events.html         ← イベント告知
│   ├── stream.html         ← 配信ページ
│   ├── memo.html           ← 攻略メモ（JSONカード）
│   └── faq.html            ← FAQ・お知らせ
│
├── css/
│   ├── main.css            ← 共通スタイル・Bootstrap上書き・変数
│   └── pages.css           ← 各ページ固有スタイル
│
├── script/
│   ├── main.js             ← 共通ロジック・CONFIG設定
│   ├── lodestone.js        ← Lodestoneデータ取得（index・members共用）
│   └── card.js             ← JSONカード生成（links・memo共用）
│
├── asset/
│   └── image/              ← 画像置き場（自由に追加してください）
│
├── admin/                  ← JSON生成管理画面
│   ├── index.html          ← 管理画面メイン
│   ├── css/
│   │   └── admin.css       ← 管理画面専用スタイル
│   └── script/
│       └── admin.js        ← 管理画面ロジック
│
└── data/                   ← JSONデータファイル
    ├── links.json          ← リンク集カードデータ
    └── memo.json           ← 攻略メモカードデータ


■ 最初にやること（必須設定）
----------------------------------------------------------
「script/main.js」を開いて、上部の CONFIG を編集してください。

  const CONFIG = {
    FC_ID: "9227453424017171422",  ← FCのID（変更不要）
    GOOGLE_CAL_SRC: "",            ← ★ GoogleカレンダーURL
    DISCORD_INVITE: "...",         ← ★ Discord招待リンク
    DISCORD_SERVER_ID: "",         ← ★ DiscordサーバーID
    TWITCH_CHANNEL: "",            ← ★ Twitchチャンネル名
    YOUTUBE_CHANNEL_ID: "",        ← ★ YouTubeチャンネルID
  };

設定するとカレンダー・配信・Discordウィジェットが自動表示されます。


■ カードデータの更新方法（リンク集・攻略メモ）
----------------------------------------------------------
1. ブラウザで「admin/index.html」を開く
2. URLを入力して「OGP取得」→ 画像・タイトル・説明が自動補完
3. 必要に応じて手動編集、カテゴリ・タグを設定
4. 「リストに追加」で追加
5. 「JSONをダウンロード」でファイルを取得
6. ダウンロードしたファイルを「data/links.json」または「data/memo.json」
   として保存してGitHubにコミット → サイトに反映


■ ページ別の編集方法
----------------------------------------------------------

【ホーム（index.html）】
・FCトップ情報はLodestoneから自動取得
・お知らせは .notice-item を追加・編集

【メンバー一覧（HTML/members.html）】
・ページを開くと自動でLodestoneからデータ取得開始
・全身ポートレート画像も自動取得（数分かかる場合あり）
・CSV出力ボタンでメンバー名簿をダウンロード可能

【ルール（HTML/rules.html）】
・.rule-item を増やすとルールを追加できます
・.rule-section-title でセクションを分けられます

【Discord（HTML/discord.html）】
・招待ボタンは CONFIG.DISCORD_INVITE で自動設定
・ウィジェットは CONFIG.DISCORD_SERVER_ID で自動設定
  （Discord: サーバー設定 → ウィジェット → 有効化 → ID取得）

【リンク集（HTML/links.html）】
・data/links.json の内容が自動でカード表示されます
・admin/index.html から編集・追加してください

【イベント（HTML/events.html）】
・Googleカレンダーは CONFIG.GOOGLE_CAL_SRC で自動設定
・手動イベントリストは .event-item を追加・編集

【配信（HTML/stream.html）】
・Twitch: CONFIG.TWITCH_CHANNEL
・YouTube: CONFIG.YOUTUBE_CHANNEL_ID
・配信者紹介は .streamer-card を追加・編集

【攻略メモ（HTML/memo.html）】
・data/memo.json の内容が自動でカード表示されます
・admin/index.html から編集・追加してください

【FAQ（HTML/faq.html）】
・BootstrapのAccordionを使用
・.accordion-item を追加してQ&Aを増やせます
・お知らせは .notice-full-item を追加・編集


■ カラーテーマのカスタマイズ
----------------------------------------------------------
「css/main.css」の :root 内の変数を変更するだけで
サイト全体の色が変わります。

  --bg-base:    #1a1d24;   ← メイン背景色
  --gold:       #c8a84b;   ← アクセントカラー（ゴールド）
  --text:       #e8eaf0;   ← メインテキスト色


■ ページを追加する場合
----------------------------------------------------------
1. HTML/ フォルダに新しいHTMLファイルを作成
2. 既存ページ（例: faq.html）をコピーして内容を変更
3. 全HTMLファイルのナビゲーション（<nav>部分）に
   新しいページへのリンクを追加

■ 公開方法（GitHub Pages 推奨）
----------------------------------------------------------
1. GitHubアカウントを作成・リポジトリを作成
2. fc-site フォルダの中身をすべてアップロード
3. Settings → Pages → Source を main ブランチに設定
4. https://ユーザー名.github.io/リポジトリ名/ で公開完了

【Netlify の場合】
https://netlify.com にアクセスしてフォルダをドラッグ&ドロップするだけ

【注意事項】
・Twitchの埋め込みはHTTPS環境が必要です
・localhost（ローカル）では一部embed機能が動作しない場合があります
・Lodestoneのデータ取得はCORSプロキシを使用しているため
  プロキシサービスの状況によっては失敗する場合があります


■ 免責事項
----------------------------------------------------------
このサイトはファンメイドのツールです。
FINAL FANTASY XIVはSQUARE ENIX CO., LTD.の著作物です。
商用利用・再配布はお控えください。

============================================================
