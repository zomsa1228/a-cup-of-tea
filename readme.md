# FC Portal
Final Fantasy XIV フリーカンパニー向けWebサイトテンプレートです。
Bootstrap 5.3 + FF14モダンテーマを使用したFCポータルサイトです。

---

## ■ ファイル構成

```text
fc-site/
├── index.html              ← ホームページ
├── README.md               ← この説明書
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
│   └── image/              ← 画像置き場
│
└── data/
    ├── links.json          ← リンク集カードデータ
    └── memo.json           ← 攻略メモカードデータ
```

---

## ■ 初期設定
`script/main.js` を開き、上部の `CONFIG` を編集してください。
```javascript
const CONFIG = {
  FC_ID: "9227453424017171422", // 対象FCのLodestone ID
  GOOGLE_CAL_SRC: "",           // GoogleカレンダーURL
  DISCORD_INVITE: "",           // Discord招待リンク
  DISCORD_SERVER_ID: "",        // DiscordサーバーID
  TWITCH_CHANNEL: "",           // Twitchチャンネル名
  YOUTUBE_CHANNEL_ID: "",       // YouTubeチャンネルID
};
```

設定するとカレンダー・配信・Discordウィジェットが自動表示されます。

---

## ■ カードデータの更新方法
リンク集・攻略メモはJSONファイルから自動生成されます。
1. ブラウザで `admin/index.html` を開く
2. URLを入力して「OGP取得」
3. 必要に応じて内容を編集
4. 「リストに追加」
5. 「JSONをダウンロード」
6. ダウンロードしたファイルを `data/links.json` または `data/memo.json` として保存
7. GitHubへコミット・プッシュ
8. GitHub Pagesへ自動反映

---

## ■ ページ別の編集方法
### ホーム（index.html）
* FC情報はLodestoneから自動取得
* お知らせは `.notice-item` を追加・編集

### メンバー一覧（HTML/members.html）
* Lodestoneから自動取得
* 全身ポートレート画像も自動取得
* CSV出力可能

### ルール（HTML/rules.html）
* `.rule-item` を追加するとルールを増やせます
* `.rule-section-title` でセクションを分割できます

### Discord（HTML/discord.html）
* 招待リンクは `CONFIG.DISCORD_INVITE`
* ウィジェットは `CONFIG.DISCORD_SERVER_ID`

DiscordサーバーID取得手順
1. サーバー設定
2. ウィジェット
3. ウィジェットを有効化
4. サーバーIDを取得

### リンク集（HTML/links.html）
* `data/links.json` を自動表示
* 管理画面から編集

### イベント（HTML/events.html）
* Googleカレンダーは `CONFIG.GOOGLE_CAL_SRC`
* 手動イベントは `.event-item` を追加

### 配信（HTML/stream.html）
* Twitch：`CONFIG.TWITCH_CHANNEL`
* YouTube：`CONFIG.YOUTUBE_CHANNEL_ID`
* 配信者紹介は `.streamer-card` を追加

### 攻略メモ（HTML/memo.html）
* `data/memo.json` を自動表示
* 管理画面から編集

### FAQ（HTML/faq.html）
* Bootstrap Accordionを使用
* `.accordion-item` を追加してQ&Aを増やせます
* お知らせは `.notice-full-item` を追加

---

## ■ カラーテーマの変更
`css/main.css` の `:root` を編集してください。

```css
--bg-base: #1a1d24;
--gold: #c8a84b;
--text: #e8eaf0;
```

---

## ■ ページを追加する場合
1. `HTML/` フォルダに新しいHTMLファイルを作成
2. 既存ページ（例：`faq.html`）をコピーして編集
3. 各HTMLファイルのナビゲーションへリンクを追加

---

## ■ GitHub Pagesで公開する
1. GitHubアカウントとリポジトリを作成
2. `fc-site` フォルダの内容をアップロード
3. `Settings → Pages` を開く
4. Source を `main` ブランチに設定
5. 数分待つ
6. `https://ユーザー名.github.io/リポジトリ名/` で公開完了

---

## ■ 注意事項

* Twitch埋め込みはHTTPS環境が必要です
* localhost環境では一部埋め込み機能が動作しない場合があります

> [!WARNING]
> Lodestoneデータ取得はCORSプロキシを利用しています。
> Lodestoneの仕様変更やプロキシサービス停止により、取得機能が利用できなくなる場合があります。

---

## ■ 使用ライブラリ
* Bootstrap 5.3
* MDB5 FREE 6.1.0

### MDB5 Licence
Documentation:
https://mdbootstrap.com/docs/standard/

License:
https://mdbootstrap.com/general/license/

Contact:
[office@mdbootstrap.com](mailto:office@mdbootstrap.com)

Version:
FREE 6.1.0

---

## ■ 免責事項
本サイトはファンメイドコンテンツです。
FINAL FANTASY XIV の著作権は SQUARE ENIX CO., LTD. に帰属します。
商用利用・再配布はお控えください。
© SQUARE ENIX
