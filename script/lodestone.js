/* ============================================================
   lodestone.js
   役割: LodestoneからFCデータを取得・解析する
         - FCトップ（FC名・クレスト全レイヤー・サーバーなど）
         - メンバーリスト（全ページ自動取得）
         - キャラクター個別ページ（全身ポートレート）
   読み込み先: index.html・HTML/members.html
   依存: main.js
============================================================ */

'use strict';

// ============================================================
// ランク定義
// ★ FCのランク名が異なる場合はここを編集してください
// ============================================================
const RANK_ORDER = ['Company Master','Second in Command','Officer','Member','Recruit'];
const RANK_META  = {
  'Company Master':    { ja:'団長',    icon:'♔', color:'#FFD700' },
  'Second in Command': { ja:'副団長',  icon:'♕', color:'#C0C0C0' },
  'Officer':           { ja:'幹部',    icon:'★', color:'#E07B39' },
  'Member':            { ja:'メンバー',icon:'◆', color:'#6AAFF5' },
  'Recruit':           { ja:'新人',    icon:'◇', color:'#888888' },
};
const getRankMeta = r => RANK_META[r] || { ja: r||'メンバー', icon:'◆', color:'#6AAFF5' };

// ============================================================
// parseFCTop()
// FCトップページのHTMLを解析する
// ★ クレストは全レイヤーのimgを配列で返す（重ね合わせ表示用）
// ============================================================
function parseFCTop(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const tryText = (...sels) => {
    for (const s of sels) {
      const el = doc.querySelector(s);
      if (el?.textContent.trim()) return el.textContent.trim();
    }
    return null;
  };

  const name   = tryText('.entry__freecompany__name') || '(FC名を取得できませんでした)';
  const gc     = tryText('.entry__freecompany__gc') || '';
  const slogan = tryText('.freecompany__text--about') || '';
  const formed = tryText('.freecompany__text__day') || '';

  const memEl = doc.querySelector('.freecompany__text__member, .entry__freecompany__members');
  const memberCount = memEl ? (memEl.textContent.match(/\d+/) || ['?'])[0] : '?';

  // ★ クレスト: 全レイヤーのimgを全て取得する
  // LodestoneのFC紋章は複数のpng画像を重ねて1つの紋章を表現している
  // 例: 背景色レイヤー → デザインレイヤー → フレームレイヤー
  const crestContainer = doc.querySelector('.entry__freecompany__crest__image, .freecompany-crest');
  const crestLayers = crestContainer
    ? [...crestContainer.querySelectorAll('img')].map(img => img.src).filter(Boolean)
    : [];

  return { name, gc, slogan, formed, memberCount, crestLayers };
}

// ============================================================
// buildCrestHTML()
// 役割: クレストの全レイヤーを重ねて表示するHTMLを生成する
//        FF14のゲーム内クレスト表示と同じ方法で重ねる
// 引数: layers (string[]) 画像URLの配列（順番通りに重ねる）
//        size   (number)  表示サイズ（px）
// ============================================================
function buildCrestHTML(layers, size = 80) {
  if (!layers || layers.length === 0) {
    // クレストが取得できなかった場合のフォールバック
    return `<div class="crest-wrap" style="width:${size}px;height:${size}px;
      display:flex;align-items:center;justify-content:center;
      background:rgba(18,102,241,0.08);border-radius:50%;
      border:2px solid var(--border)">⚔</div>`;
  }

  // 全レイヤーを position:absolute で重ね合わせる
  const imgs = layers.map((src, i) => `
    <img src="${escHtml(src)}" alt="crest layer ${i + 1}"
      style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;"
      loading="lazy">`
  ).join('');

  return `
    <div class="crest-wrap" style="width:${size}px;height:${size}px;position:relative;flex-shrink:0;">
      ${imgs}
    </div>`;
}

// ============================================================
// renderFCHero()
// 役割: 取得したFC情報をホームのヒーローバナーに描画する
// ============================================================
function renderFCHero(info, targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;

  el.innerHTML = `
    <div class="hero-banner d-flex align-items-center gap-4 flex-wrap mb-4">
      ${buildCrestHTML(info.crestLayers, 80)}
      <div class="flex-grow-1">
        <h1 class="hero-fc-name">${escHtml(info.name)}</h1>
        ${info.gc     ? `<div class="hero-server">${escHtml(info.gc)}</div>` : ''}
        ${info.slogan ? `<div class="hero-slogan">"${escHtml(info.slogan)}"</div>` : ''}
        ${info.formed ? `<div class="hero-formed">🏰 結成日: ${escHtml(info.formed)}</div>` : ''}
      </div>
      <div class="text-center flex-shrink-0">
        <span class="hero-stat-n" id="hero-member-count">${escHtml(info.memberCount)}</span>
        <span class="hero-stat-l">MEMBERS</span>
      </div>
    </div>`;
}

// ============================================================
// loadFCTop()
// 役割: FCトップを取得してホームに表示する
//        コンテンツエリア内にプログレスバーを表示
// ============================================================
async function loadFCTop(targetId = 'home-hero-wrap') {
  // コンテンツ内ローディング表示
  showContentLoader(targetId, 'hero-progress', 'hero-progress-text', 'FCデータを取得中...');
  updateProgress('hero-progress', 'hero-progress-text', 20, 'Lodestoneに接続中...');

  try {
    updateProgress('hero-progress', 'hero-progress-text', 50, 'FCデータを解析中...');
    const html = await fetchHTML(LODESTONE.FC_TOP());
    updateProgress('hero-progress', 'hero-progress-text', 90, '表示を準備中...');
    const info = parseFCTop(html);
    renderFCHero(info, targetId);
  } catch (e) {
    showError(targetId, `FCトップ情報の取得に失敗しました。（${e.message}）`, () => loadFCTop(targetId));
  }
}

// ============================================================
// parseMembersPage()
// メンバーリストページのHTMLを解析する
// ============================================================
function parseMembersPage(html) {
  const doc     = new DOMParser().parseFromString(html, 'text/html');
  const members = [];

  doc.querySelectorAll('.entry').forEach(el => {
    const name   = el.querySelector('.entry__name')?.textContent.trim() || '';
    const rankImg = el.querySelector('.entry__freecompany__fc-member__info .entry__freecompany__member__icon img');
    const rank   = rankImg?.getAttribute('title') || '';
    const job    = el.querySelector('.entry__job')?.textContent.trim() || '';
    const avatar = el.querySelector('.entry__chara__face img')?.src || null;
    const href   = el.querySelector('a.entry__bg')?.getAttribute('href') || '';
    const charId = (href.match(/character\/(\d+)/) || [])[1] || null;
    const server = el.querySelector('.entry__world')?.textContent.trim() || '';
    if (name) members.push({ name, rank, job, avatar, charId, server, portrait: null });
  });

  const totalText = doc.querySelector('.parts__total')?.textContent || '';
  const total     = parseInt((totalText.match(/(\d+)/) || [0,0])[1]) || members.length;
  const pageNums  = [...doc.querySelectorAll('.btn__pager__current, .btn__pager a')]
    .map(a => parseInt(a.textContent.trim())).filter(n => !isNaN(n));
  const lastPage  = pageNums.length ? Math.max(...pageNums) : 1;

  return { members, total, lastPage };
}

// ============================================================
// fetchPortrait()
// キャラクターページから全身ポートレート画像URLを取得する
// ============================================================
async function fetchPortrait(charId) {
  if (!charId) return null;
  try {
    const html = await fetchHTML(LODESTONE.CHAR(charId));
    const doc  = new DOMParser().parseFromString(html, 'text/html');
    const img  =
      doc.querySelector('.character__detail__image img') ||
      doc.querySelector('img[src*="_l.jpg"]');
    return img?.src || null;
  } catch { return null; }
}

// ============================================================
// メンバーデータ状態管理
// ============================================================
let allMembers    = [];
let membersLoaded = false;
let membersLoading = false;

// ============================================================
// loadMembers()
// 役割: ページを開いたら自動でメンバーを全ページ取得する
//        プログレスバー1本で全体進捗を表示
// ============================================================
async function loadMembers() {
  if (membersLoading) return;
  membersLoading = true;
  allMembers = [];
  membersLoaded = false;

  const idleEl    = document.getElementById('member-idle');
  const loadingEl = document.getElementById('member-loading');
  const errorEl   = document.getElementById('member-error');
  const listEl    = document.getElementById('member-list');
  const barEl     = document.getElementById('member-progress-bar');
  const txtEl     = document.getElementById('member-progress-text');

  if (idleEl)    idleEl.style.display    = 'none';
  if (errorEl)   errorEl.style.display   = 'none';
  if (listEl)    listEl.style.display    = 'none';
  if (loadingEl) loadingEl.style.display = 'flex';

  // プログレスバーとテキストを更新するヘルパー
  const setBar = pct => { if (barEl) { barEl.style.width = Math.min(100,pct)+'%'; barEl.setAttribute('aria-valuenow', pct); } };
  const setTxt = msg  => { if (txtEl) txtEl.textContent = msg; };

  try {
    // STEP1: 1ページ目取得（総数・総ページ確認）
    setTxt('メンバーデータを取得中...');
    setBar(5);
    const html1 = await fetchHTML(LODESTONE.FC_MEMBER(1));
    const { members: m1, total, lastPage } = parseMembersPage(html1);
    allMembers.push(...m1);
    setBar((allMembers.length / Math.max(total,1)) * 50); // 全体の50%をメンバー取得に割り当て
    setTxt(`メンバー取得中... ${allMembers.length} / ${total} 名`);

    // STEP2: 2ページ目以降
    for (let page = 2; page <= lastPage; page++) {
      await sleep(700);
      const html = await fetchHTML(LODESTONE.FC_MEMBER(page));
      const { members: pm } = parseMembersPage(html);
      allMembers.push(...pm);
      setBar((allMembers.length / Math.max(total,1)) * 50);
      setTxt(`メンバー取得中... ${allMembers.length} / ${total} 名（${page}/${lastPage}ページ）`);
    }

    // STEP3: 全身ポートレート画像取得（5件並列）
    // プログレス後半50%を画像取得に割り当て
    const withId = allMembers.filter(m => m.charId);
    const CHUNK  = 5;

    for (let i = 0; i < withId.length; i += CHUNK) {
      const batch = withId.slice(i, i + CHUNK);
      await Promise.all(batch.map(async m => { m.portrait = await fetchPortrait(m.charId); }));
      const imgPct = ((i + batch.length) / Math.max(withId.length,1)) * 50;
      setBar(50 + imgPct);
      setTxt(`全身画像を取得中... ${Math.min(i+CHUNK, withId.length)} / ${withId.length}`);
      await sleep(400);
    }

    // 完了
    membersLoaded  = true;
    membersLoading = false;
    setBar(100);
    setTxt('取得完了！');
    await sleep(400);
    if (loadingEl) loadingEl.style.display = 'none';
    if (listEl)    listEl.style.display    = 'block';
    renderMembers();

  } catch (e) {
    membersLoading = false;
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) {
      errorEl.style.display = 'block';
      document.getElementById('member-error-msg').textContent = `取得失敗: ${e.message}`;
    }
  }
}

// ============================================================
// renderMembers() / renderRankGroup() / memberCardHTML()
// ============================================================
function renderMembers() {
  const q    = document.getElementById('member-filter')?.value.toLowerCase() || '';
  const sort = document.getElementById('member-sort')?.value || 'rank';

  const filtered = allMembers
    .filter(m => !q || m.name.toLowerCase().includes(q) || m.job.toLowerCase().includes(q) || m.rank.toLowerCase().includes(q))
    .sort((a,b) => {
      if (sort==='name') return a.name.localeCompare(b.name,'ja');
      if (sort==='job')  return a.job.localeCompare(b.job,'ja');
      const ai=RANK_ORDER.indexOf(a.rank), bi=RANK_ORDER.indexOf(b.rank);
      return (ai<0?99:ai)-(bi<0?99:bi);
    });

  const countEl = document.getElementById('member-count');
  if (countEl) countEl.textContent = `${filtered.length} 名表示 / 全 ${allMembers.length} 名`;

  let html = '';
  if (sort === 'rank') {
    const groups = {};
    filtered.forEach(m => { const k=m.rank||'Member'; (groups[k]=groups[k]||[]).push(m); });
    [...RANK_ORDER, ...Object.keys(groups).filter(k=>!RANK_ORDER.includes(k))]
      .filter(r => groups[r])
      .forEach(r => { html += renderRankGroup(r, groups[r]); });
  } else {
    html = `<div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
      ${filtered.map(memberCardHTML).join('')}</div>`;
  }

  const out = document.getElementById('member-output');
  if (out) out.innerHTML = html || '<p class="text-secondary p-4">該当するメンバーが見つかりません</p>';
}

function renderRankGroup(rank, list) {
  const rm = getRankMeta(rank);
  return `
    <div class="rank-group">
      <div class="rank-heading">
        <span class="rank-label" style="color:${rm.color};border-color:${rm.color}55;background:${rm.color}14">
          ${rm.icon} ${rm.ja}
        </span>
        <span class="rank-cnt">${list.length}名</span>
      </div>
      <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
        ${list.map(memberCardHTML).join('')}
      </div>
    </div>`;
}

function memberCardHTML(m) {
  const rm  = getRankMeta(m.rank);
  const url = m.charId ? LODESTONE.CHAR(m.charId) : '#';
  const imgHtml = m.portrait
    ? `<img class="mcard-portrait" src="${escHtml(m.portrait)}" alt="${escHtml(m.name)}" loading="lazy">`
    : m.avatar
    ? `<img class="mcard-portrait" src="${escHtml(m.avatar)}" alt="${escHtml(m.name)}" loading="lazy" style="aspect-ratio:1/1;object-position:center;">`
    : `<div class="mcard-portrait-ph">⚔</div>`;
  return `
    <div class="col">
      <a class="mcard" href="${url}" target="_blank" rel="noopener noreferrer">
        ${imgHtml}
        <div class="mcard-rank-row">
          <span class="mcard-rank-icon" style="color:${rm.color}">${rm.icon}</span>
        </div>
        <div class="mcard-info">
          <p class="mcard-name">${escHtml(m.name)}</p>
          ${m.server?`<p class="mcard-server">${escHtml(m.server)}</p>`:''}
          ${m.job?`<p class="mcard-job">${escHtml(m.job)}</p>`:''}
          <p class="mcard-rank-text" style="color:${rm.color}">${rm.icon} ${rm.ja}</p>
        </div>
      </a>
    </div>`;
}

// ============================================================
// exportCSV()
// ============================================================
function exportCSV() {
  if (!allMembers.length) return;
  const header = ['名前','サーバー','ランク','ジョブ','キャラクターID'];
  const rows   = allMembers.map(m=>[m.name,m.server,m.rank,m.job,m.charId||'']);
  const csv    = [header,...rows].map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
  const a      = document.createElement('a');
  a.href       = URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));
  a.download   = 'fc_members.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
