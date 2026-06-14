/* ============================================================
   main.js
   役割: 全ページ共通ロジック
         - サイト設定（CONFIG）
         - ダーク/ライトモード切り替え（端末設定自動取得）
         - コンテンツ内ローディング（プログレスバー＋テキスト）
         - CORSプロキシ経由のHTMLフェッチ
         - ユーティリティ関数
   読み込み先: 全HTMLファイル
============================================================ */

'use strict';

// ============================================================
// サイト設定
// ★★★ ここを編集してください ★★★
// 
// ============================================================
const CONFIG = {
  FC_ID: "9227453424017171422",

  // ★ Googleカレンダーのiframeのsrc属性を貼り付け
  GOOGLE_CAL_SRC: "",

  // ★ Discord招待リンク
  DISCORD_INVITE: "https://discord.gg/xHz5XmEVud",

  // ★ DiscordウィジェットのサーバーID
  DISCORD_SERVER_ID: "613638497370243072",

  // ★ Twitchチャンネル名（https://twitch.tv/xxxx の xxxx 部分）
  TWITCH_CHANNEL: "roimy_zomsa",

  // ★ YouTubeチャンネルID
  YOUTUBE_CHANNEL_ID: "UC1SAjLgXuVuH94nDoZAnXIA",
};

// ============================================================
// Lodestone URL
// ============================================================
const LODESTONE = {
  FC_TOP:    ()     => `https://jp.finalfantasyxiv.com/lodestone/freecompany/${CONFIG.FC_ID}/`,
  FC_MEMBER: (page) => `https://jp.finalfantasyxiv.com/lodestone/freecompany/${CONFIG.FC_ID}/member/?page=${page}`,
  CHAR:      (id)   => `https://jp.finalfantasyxiv.com/lodestone/character/${id}/`,
};

// ============================================================
// CORSプロキシ
// ★ ローカル確認はLive Server（http://）で行うこと（file://は不可）
// ============================================================
const PROXIES = [
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

// ============================================================
// ダーク/ライトモード
// 端末設定を自動取得し、右上ボタンで手動切り替え可能
// localStorage に保存して次回訪問時も維持
// ============================================================

// テーマを適用する
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('fc-theme', theme);

  // トグルボタンのアイコンを更新
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// 初期テーマを決定（保存済み → 端末設定 → dark）
function initTheme() {
  const saved  = localStorage.getItem('fc-theme');
  const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || prefer);
}

// トグルボタンのクリックで切り替え
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// 端末テーマ変更を監視（ブラウザのダークモード切り替え時）
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  // 手動設定がある場合は上書きしない
  if (!localStorage.getItem('fc-theme')) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

// ============================================================
// コンテンツ内ローディング
// ページ全体は覆わず、各コンテンツエリア内にのみ表示する
// ============================================================

// ---- プログレスバー付きローダーをエリアに表示 ----
// 引数: targetId   表示先要素のID
//        progressId プログレスバー要素のID（後から updateProgress() で更新）
//        textId     テキスト要素のID
//        message    初期テキスト
function showContentLoader(targetId, progressId, textId, message = '読み込み中...') {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.innerHTML = `
    <div class="content-loader">
      <div class="content-loader-bar-wrap">
        <div class="progress">
          <div id="${progressId}" class="progress-bar" role="progressbar"
               style="width:0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
          </div>
        </div>
      </div>
      <div id="${textId}" class="content-loader-text">${escHtml(message)}</div>
    </div>`;
}

// ---- プログレスバーとテキストを更新 ----
// 引数: progressId プログレスバー要素のID
//        textId     テキスト要素のID
//        pct        進捗パーセント（0〜100）
//        message    表示テキスト
function updateProgress(progressId, textId, pct, message) {
  const bar = document.getElementById(progressId);
  const txt = document.getElementById(textId);
  if (bar) {
    bar.style.width = Math.min(100, pct) + '%';
    bar.setAttribute('aria-valuenow', pct);
  }
  if (txt && message) txt.textContent = message;
}

// ---- シンプルなスピナーローダー（プログレス不要な場合） ----
function showLoading(targetId, message = '読み込み中...') {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.innerHTML = `
    <div class="content-loader">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="content-loader-text">${escHtml(message)}</div>
    </div>`;
}

// ---- エラー表示 ----
function showError(targetId, message, onRetry = null) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const retryBtn = onRetry
    ? `<button class="btn btn-outline-danger btn-sm ms-2"
        onclick="(${onRetry.toString()})()">再試行</button>`
    : '';
  el.innerHTML = `
    <div class="alert alert-danger d-flex align-items-center gap-2 mb-0" role="alert">
      <span>⚠</span>
      <span class="flex-grow-1">${escHtml(message)}</span>
      ${retryBtn}
    </div>`;
}

// ============================================================
// fetchHTML()
// CORSプロキシ経由でURLのHTMLを取得する
// ============================================================
async function fetchHTML(url) {
  let lastErr;
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy(url), { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      // allorigins.win はJSONラッパーで返ってくる
      if (text.trim().startsWith('{')) {
        try {
          const json = JSON.parse(text);
          if (json.contents && json.contents.length > 500) return json.contents;
        } catch (_) {}
      }
      if (text.length > 500) return text;
      throw new Error('レスポンスが空です');
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('全プロキシで取得に失敗しました');
}

// ============================================================
// injectEmbed()
// CONFIGの設定値に基づいてiframeを動的に注入する
// ============================================================
function injectEmbed(targetId, src, height, placeholderHtml) {
  const el = document.getElementById(targetId);
  if (!el || el.dataset.injected) return;
  if (src) {
    el.innerHTML = `
      <iframe src="${escHtml(src)}" width="100%" height="${height}"
        frameborder="0" allowfullscreen loading="lazy"
        style="display:block;border:none"></iframe>`;
  } else {
    el.innerHTML = placeholderHtml;
  }
  el.dataset.injected = '1';
}

// ============================================================
// ユーティリティ
// ============================================================

// 待機（レート制限対策）
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// XSSエスケープ
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ============================================================
// DOMContentLoaded: 共通初期化
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  // テーマ初期化（端末設定取得）
  initTheme();

  // ---- ダークモードトグルボタンを右上に生成 ----
  const toggleBtn = document.createElement('button');
  toggleBtn.id        = 'theme-toggle-btn';
  toggleBtn.className = 'theme-toggle-btn';
  toggleBtn.title     = 'ダーク/ライト切り替え';
  toggleBtn.onclick   = toggleTheme;
  // アイコンは initTheme → applyTheme で設定される
  document.body.appendChild(toggleBtn);

  // ---- ナビゲーション: 現在ページをactiveに ----
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // ---- Discord招待リンクを自動設定 ----
  document.querySelectorAll('.discord-invite-link').forEach(a => {
    if (CONFIG.DISCORD_INVITE) a.href = CONFIG.DISCORD_INVITE;
  });

});
