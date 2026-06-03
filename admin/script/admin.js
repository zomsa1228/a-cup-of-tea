/* ============================================================
   admin.js
   役割: 管理画面のロジック
         - URLからOGP情報取得・フォーム自動補完
         - カードリスト管理（追加・削除）
         - JSONプレビュー・ダウンロード・コピー
         - 既存JSONの読み込み
   依存: ../script/main.js（fetchHTML・escHtml）
============================================================ */

'use strict';

let cardList = [];

// ============================================================
// OGP取得
// ============================================================
async function fetchOGP() {
  const url = document.getElementById('input-url').value.trim();
  if (!url) { showToast('⚠ URLを入力してください'); return; }

  const btnText = document.getElementById('ogp-btn-text');
  btnText.innerHTML = '<span class="ogp-loading"></span>取得中...';

  try {
    const html = await fetchHTML(url);
    const doc  = new DOMParser().parseFromString(html, 'text/html');

    const title = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
               || doc.querySelector('title')?.textContent?.trim() || '';
    const description = doc.querySelector('meta[property="og:description"]')?.getAttribute('content')
                     || doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

    document.getElementById('input-title').value       = title;
    document.getElementById('input-description').value = description;
    document.getElementById('input-image').value       = image;
    document.getElementById('input-link-url').value    = url;

    updateImagePreview(image);
    updateCardPreview();
    showToast('✅ OGP情報を取得しました');
  } catch (e) {
    showToast(`⚠ OGP取得失敗: ${e.message}`);
  } finally {
    btnText.textContent = '🔍 OGP取得';
  }
}

// ============================================================
// 画像・カードプレビュー更新
// ============================================================
function updateImagePreview(imageUrl) {
  const wrap = document.getElementById('img-preview-wrap');
  if (!wrap) return;
  wrap.innerHTML = imageUrl
    ? `<img src="${escHtml(imageUrl)}" alt="preview" onerror="this.parentElement.innerHTML='<span style=color:var(--text-mute);font-size:0.75rem>画像なし</span>'">`
    : '<span class="text-secondary" style="font-size:0.75rem">プレビュー</span>';
}

function updateCardPreview() {
  const title       = document.getElementById('input-title')?.value || '';
  const description = document.getElementById('input-description')?.value || '';
  const image       = document.getElementById('input-image')?.value || '';
  const emoji       = document.getElementById('input-emoji')?.value || '🔗';
  const tagsRaw     = document.getElementById('input-tags')?.value || '';
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

  const preview = document.getElementById('card-preview');
  if (!preview) return;

  const imgHtml = image
    ? `<img class="json-card-img" src="${escHtml(image)}" alt=""
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="json-card-img-ph" style="display:none">${escHtml(emoji)}</div>`
    : `<div class="json-card-img-ph">${escHtml(emoji)}</div>`;

  const tagsHtml = tags.length
    ? `<div class="json-card-tags">${tags.map(t=>`<span class="json-card-tag">${escHtml(t)}</span>`).join('')}</div>`
    : '';

  preview.innerHTML = `
    ${imgHtml}
    <div class="json-card-body">
      <div class="json-card-title">${escHtml(title)||'<span style="color:var(--text-mute)">タイトル</span>'}</div>
      ${description?`<p class="json-card-desc">${escHtml(description)}</p>`:''}
      ${tagsHtml}
      <span class="json-card-btn" style="display:block;cursor:default">開く ↗</span>
    </div>`;
}

// ============================================================
// リスト操作
// ============================================================
function addToList() {
  const title = document.getElementById('input-title').value.trim();
  const url   = document.getElementById('input-link-url').value.trim();
  if (!title) { showToast('⚠ タイトルは必須です'); return; }
  if (!url)   { showToast('⚠ URLは必須です'); return; }

  const card = {
    title,
    description: document.getElementById('input-description').value.trim() || undefined,
    image:       document.getElementById('input-image').value.trim() || undefined,
    url,
    emoji:       document.getElementById('input-emoji').value.trim() || undefined,
    category:    document.getElementById('input-category').value.trim() || undefined,
    tags:        document.getElementById('input-tags').value.split(',').map(t=>t.trim()).filter(Boolean),
  };
  // 空フィールドを削除
  Object.keys(card).forEach(k => { if (!card[k] || (Array.isArray(card[k]) && !card[k].length)) delete card[k]; });

  cardList.push(card);
  renderCardList();
  updateJSONPreview();
  clearForm();
  showToast('✅ リストに追加しました');
}

function removeFromList(index) {
  cardList.splice(index, 1);
  renderCardList();
  updateJSONPreview();
}

function renderCardList() {
  const listEl  = document.getElementById('card-list');
  const countEl = document.getElementById('list-count');
  if (!listEl) return;
  countEl.textContent = `（${cardList.length}件）`;

  if (!cardList.length) {
    listEl.innerHTML = `<div class="col-12 text-center text-secondary py-4" id="list-empty"><p style="font-size:0.875rem">まだカードが追加されていません</p></div>`;
    return;
  }

  listEl.innerHTML = cardList.map((card, i) => `
    <div class="col">
      <div class="list-card-wrap">
        <button class="list-card-delete" onclick="removeFromList(${i})" title="削除">✕</button>
        <div class="json-card">
          ${card.image
            ? `<img class="json-card-img" src="${escHtml(card.image)}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
               <div class="json-card-img-ph" style="display:none">${escHtml(card.emoji||'🔗')}</div>`
            : `<div class="json-card-img-ph">${escHtml(card.emoji||'🔗')}</div>`}
          <div class="json-card-body">
            <div class="json-card-title">${escHtml(card.title)}</div>
            ${card.description?`<p class="json-card-desc">${escHtml(card.description)}</p>`:''}
            ${card.tags?.length?`<div class="json-card-tags">${card.tags.map(t=>`<span class="json-card-tag">${escHtml(t)}</span>`).join('')}</div>`:''}
            <span class="json-card-btn" style="display:block;cursor:default">開く ↗</span>
          </div>
        </div>
      </div>
    </div>`
  ).join('');
}

function updateJSONPreview() {
  const el = document.getElementById('json-preview');
  if (el) el.value = JSON.stringify(cardList, null, 2);
}

// ============================================================
// JSON操作
// ============================================================
function downloadJSON() {
  if (!cardList.length) { showToast('⚠ リストが空です'); return; }
  const type     = document.getElementById('json-type').value;
  const filename = type === 'links' ? 'links.json' : 'memo.json';
  const a        = document.createElement('a');
  a.href         = URL.createObjectURL(new Blob([JSON.stringify(cardList, null, 2)], {type:'application/json'}));
  a.download     = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast(`💾 ${filename} をダウンロードしました`);
}

async function copyJSON() {
  const json = document.getElementById('json-preview')?.value;
  if (!json) { showToast('⚠ コピーするJSONがありません'); return; }
  try {
    await navigator.clipboard.writeText(json);
    showToast('📋 クリップボードにコピーしました');
  } catch { showToast('⚠ コピーに失敗しました'); }
}

function loadExistingJSON(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('配列形式のJSONではありません');
      cardList = data;
      renderCardList();
      updateJSONPreview();
      showToast(`✅ ${file.name} を読み込みました（${data.length}件）`);
    } catch (err) { showToast(`⚠ 読み込み失敗: ${err.message}`); }
  };
  reader.readAsText(file, 'utf-8');
  input.value = '';
}

function clearForm() {
  ['input-url','input-title','input-description','input-image','input-emoji','input-category','input-tags','input-link-url']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  updateImagePreview('');
  updateCardPreview();
}

// ============================================================
// トースト通知
// ============================================================
function showToast(message) {
  document.querySelectorAll('.admin-toast').forEach(el => el.remove());
  const toast = document.createElement('div');
  toast.className = 'admin-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2100);
}

// ============================================================
// 初期化
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  ['input-title','input-description','input-image','input-emoji','input-tags','input-link-url']
    .forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => {
        if (id === 'input-image') updateImagePreview(document.getElementById('input-image').value);
        updateCardPreview();
      });
    });
  document.getElementById('input-url')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') fetchOGP();
  });
});
