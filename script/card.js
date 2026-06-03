/* ============================================================
   card.js
   役割: JSONファイルを読み込んでMDBカードを生成する
         - data/links.json → リンク集ページ
         - data/memo.json  → 攻略メモページ
   読み込み先: HTML/links.html・HTML/memo.html
   依存: main.js
============================================================ */

'use strict';

const JSON_PATHS = {
  links: '../data/links.json',
  memo:  '../data/memo.json',
};

async function loadJSON(type) {
  const path = JSON_PATHS[type];
  if (!path) throw new Error(`未定義のJSONタイプ: ${type}`);
  const res = await fetch(path);
  if (!res.ok) throw new Error(`JSONの読み込み失敗 (${res.status}): ${path}`);
  return await res.json();
}

// ============================================================
// renderCards()
// JSONを読み込んでMDBカードグリッドを表示する
// ============================================================
async function renderCards(type, targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;

  // スピナー表示（JSONはすぐ読み込めるのでシンプルなスピナー）
  el.innerHTML = `
    <div class="content-loader">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="content-loader-text">データを読み込み中...</div>
    </div>`;

  try {
    const items = await loadJSON(type);

    if (!items || items.length === 0) {
      el.innerHTML = `
        <div class="text-center py-5 text-secondary">
          <p>表示するデータがありません。</p>
          <p style="font-size:0.8rem">admin/ フォルダからJSONを生成して data/ フォルダに配置してください。</p>
        </div>`;
      return;
    }

    // カテゴリでグループ化
    const hasCategory = items.some(item => item.category);

    if (hasCategory) {
      const groups = {};
      items.forEach(item => {
        const key = item.category || 'その他';
        (groups[key] = groups[key] || []).push(item);
      });
      let html = '';
      for (const [category, list] of Object.entries(groups)) {
        html += `
          <div class="mb-5">
            <div class="section-heading mb-3">
              <h2 style="font-size:0.95rem">${escHtml(category)}</h2>
            </div>
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
              ${list.map(cardHTML).join('')}
            </div>
          </div>`;
      }
      el.innerHTML = html;
    } else {
      el.innerHTML = `
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
          ${items.map(cardHTML).join('')}
        </div>`;
    }

    // フェードインアニメーション
    el.querySelectorAll('.json-card').forEach((card, i) => {
      card.style.animationDelay = `${i * 0.04}s`;
      card.classList.add('fade-in-up');
    });

  } catch (e) {
    el.innerHTML = `
      <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
        <span>⚠</span>
        <span>JSONの読み込みに失敗しました: ${escHtml(e.message)}</span>
      </div>`;
  }
}

function cardHTML(item) {
  const imgHtml = item.image
    ? `<img class="json-card-img" src="${escHtml(item.image)}" alt="${escHtml(item.title||'')}" loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="json-card-img-ph" style="display:none">${escHtml(item.emoji||'🔗')}</div>`
    : `<div class="json-card-img-ph">${escHtml(item.emoji||'🔗')}</div>`;

  const tagsHtml = (item.tags?.length)
    ? `<div class="json-card-tags">${item.tags.map(t=>`<span class="json-card-tag">${escHtml(t)}</span>`).join('')}</div>`
    : '';

  const btnHtml = item.url
    ? `<a href="${escHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="json-card-btn">開く ↗</a>`
    : '';

  return `
    <div class="col">
      <div class="json-card">
        ${imgHtml}
        <div class="json-card-body">
          ${item.title       ? `<div class="json-card-title">${escHtml(item.title)}</div>` : ''}
          ${item.description ? `<p class="json-card-desc">${escHtml(item.description)}</p>` : ''}
          ${tagsHtml}
          ${btnHtml}
        </div>
      </div>
    </div>`;
}
