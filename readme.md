# A Cup of Tea

Final Fantasy XIV フリーカンパニー「A Cup of Tea」の公式ポータルサイトです。
https://zomsa1228.github.io/a-cup-of-tea/

---

## ■ ファイル構成

```text
a-cup-of-tea/
├── index.html
├── README.md
│
├── HTML/
│   ├── members.html        ← メンバー一覧（Lodestone自動取得）
│   ├── rules.html          ← FCルール
│   ├── discord.html        ← Discord案内
│   ├── links.html          ← リンク集
│   ├── events.html         ← イベント
│   ├── stream.html         ← 配信
│   ├── memo.html           ← 攻略メモ
│   └── faq.html            ← FAQ
│
├── css/
│   ├── main.css
│   └── pages.css
│
├── script/
│   ├── main.js             ← 共通ロジック・CONFIG
│   ├── lodestone.js        ← Lodestoneデータ取得
│   └── card.js             ← JSONカード生成
│
├── asset/
│   └── image/
│
└── data/
    ├── links.json          ← リンク集データ
    ├── memo.json           ← 攻略メモデータ
    └── streamers.json      ← 配信者データ
```

---

## ■ データ管理

`data/` フォルダ内のJSONファイルでリンク集・攻略メモ・配信者情報を管理しています。
JSONの編集には専用アプリ（別リポジトリ）を使用します。
専用アプリはGitHub APIを通じて `data/` フォルダへ直接アップロードします。

---

## ■ 使用ライブラリ

- MDB UI Kit 7.3.2
- Font Awesome 6.5

---

## ■ 免責事項

本サイトはファンメイドコンテンツです。
FINAL FANTASY XIV の著作権は SQUARE ENIX CO., LTD. に帰属します。
© SQUARE ENIX