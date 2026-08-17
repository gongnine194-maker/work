/* ===== 智讯工作台 前端逻辑 ===== */
(() => {
  'use strict';

  const DATA_URL = '../data/latest.json';
  const CACHE_KEY = 'workbench-data-v1';

  const SECTIONS = {
    aiNews:           { title: 'AI 大模型热点',   emoji: '🤖', desc: '大模型 / AI 行业每日动态' },
    industryInvest:   { title: '行业投资动态',     emoji: '💰', desc: '各行业融资、并购、IPO' },
    top500:           { title: '500强融资投资',   emoji: '🏢', desc: '中国 500 强企业重点动态' },
    newProducts:      { title: '新品上市',         emoji: '📦', desc: '各平台新品发布' },
    influencerVideos: { title: '达人合作爆款',     emoji: '🎬', desc: '达人 / KOL 合作与爆款内容' },
    crossCollab:      { title: '跨界合作',         emoji: '🤝', desc: '品牌联名与跨界营销' },
    hotTopics:        { title: '营销热点',         emoji: '🔥', desc: '行业营销热点话题' },
    startup:          { title: '创业机会',         emoji: '🚀', desc: '新赛道与创业方向' },
  };

  let DATA = null;      // 最新数据
  let lastOnline = false;

  const $ = (sel) => document.querySelector(sel);
  const view = $('#view');

  /* ---------- 数据加载 ---------- */
  async function loadData(silent) {
    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (json && json.sections) {
        DATA = json;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(json)); } catch {}
        lastOnline = true;
        $('#offlineBar').classList.add('hidden');
        if (!silent) toast('数据已更新');
      } else {
        throw new Error('数据格式错误');
      }
    } catch {
      // 网络失败 → 用缓存
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        DATA = JSON.parse(cached);
        lastOnline = false;
        $('#offlineBar').classList.remove('hidden');
        toast('网络不可用，显示缓存数据');
      } else {
        view.innerHTML = '<div class="empty"><div class="big">😵</div>首次加载失败，请检查网络<br>（数据由 GitHub 定时任务生成）</div>';
      }
    }
    render();
  }

  /* ---------- 时间格式化 ---------- */
  function fmtTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getMonth() + 1}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  function nextUpdateText() {
    // 北京时间 08:00 / 20:00
    const now = new Date();
    const bj = new Date(now.getTime() + 8 * 3600 * 1000);
    const p = (n) => String(n).padStart(2, '0');
    const today = `${bj.getUTCFullYear()}-${p(bj.getUTCMonth() + 1)}-${p(bj.getUTCDate())}`;
    let next = new Date(`${today}T08:00:00Z`);
    if (bj.getTime() >= next.getTime()) next = new Date(`${today}T20:00:00Z`);
    if (bj.getTime() >= next.getTime()) next = new Date(`${new Date(bj.getTime() + 86400000).toISOString().slice(0, 10)}T08:00:00Z`);
    const diff = next.getTime() - bj.getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}小时${m}分后（北京时间 ${fmtTime(next.toISOString().replace('Z', '+08:00'))}）`;
  }

  /* ---------- 渲染 ---------- */
  function counts() {
    const c = {};
    if (DATA) for (const k of Object.keys(SECTIONS)) c[k] = (DATA.sections[k] || []).length;
    return c;
  }

  function renderItem(it) {
    const curated = it.curated ? ' curated' : '';
    const time = it.publishedAt ? fmtTime(it.publishedAt) : '';
    const url = it.url && /^https?:\/\//i.test(it.url) ? it.url : '#';
    const src = it.source ? `<span class="chip${curated ? ' curated' : ''}">${esc(it.source)}</span>` : '';
    return `<a class="item${curated}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">
      <h3>${esc(it.title)}</h3>
      ${it.summary ? `<p class="sum">${esc(it.summary)}</p>` : ''}
      <div class="meta">${src}${time ? `<span>🕐 ${time}</span>` : ''}<span class="arrow">›</span></div>
    </a>`;
  }

  function renderSectionList(items) {
    if (!items || items.length === 0) {
      return `<div class="empty"><div class="big">🗒️</div>暂无内容<br><small>可编辑 fetcher/manual/manual.json 手动补充</small></div>`;
    }
    return items.map(renderItem).join('');
  }

  function renderSectionView(key) {
    const meta = SECTIONS[key];
    const items = DATA ? (DATA.sections[key] || []) : [];
    return `<div class="section-head">
        <div class="section-title">${meta.emoji} ${meta.title}</div>
        <div class="section-count">${meta.desc} · ${items.length} 条</div>
      </div>
      <div>${renderSectionList(items)}</div>`;
  }

  function renderHome() {
    if (!DATA) return '<div class="empty"><div class="big">⏳</div>加载中…</div>';
    const c = counts();
    const src = DATA.sources || { ok: [], failed: [] };
    const tiles = Object.keys(SECTIONS).map((k) => `
      <a class="tile" href="#/${k}">
        <div class="t-emoji">${SECTIONS[k].emoji}</div>
        <div class="t-name">${SECTIONS[k].title}</div>
        <div class="t-count">${c[k]} 条动态</div>
      </a>`).join('');
    const failHtml = src.failed && src.failed.length
      ? src.failed.map((f) => `<span class="v bad">${esc(f)}</span>`).join('') : '<span class="v ok">全部正常</span>';
    return `
      <div class="hero">
        <h1>早上好 👋</h1>
        <div class="sub">你的 AI · 投资 · 营销 · 创业情报工作台</div>
        <div class="times">
          <div>上次更新<b>${fmtTime(DATA.updatedAt)}</b></div>
          <div>下次更新<b>${nextUpdateText()}</b></div>
        </div>
      </div>
      <div class="grid">${tiles}</div>
      <div class="card">
        <div class="section-title" style="font-size:16px;margin-bottom:6px">📡 数据源状态</div>
        <div class="about-row"><span class="k">正常源</span><span class="v ok">${(src.ok || []).length} 个：${esc((src.ok || []).join('、'))}</span></div>
        <div class="about-row"><span class="k">失败源</span>${failHtml}</div>
      </div>`;
  }

  function renderAbout() {
    if (!DATA) return '<div class="empty">…</div>';
    const src = DATA.sources || { ok: [], failed: [] };
    const failed = src.failed && src.failed.length ? `<div class="about-row"><span class="k">失败源</span><span class="v bad">${esc(src.failed.join('、'))}</span></div>` : '';
    return `<div class="card">
        <div class="section-title" style="font-size:16px;margin-bottom:8px">ℹ️ 关于智讯工作台</div>
        <p style="font-size:13.5px;color:var(--text-2);margin:0">
          每天 08:00 与 20:00（北京时间）由 GitHub Actions 自动抓取公开 RSS 源，
          聚合生成 AI 大模型热点、行业投资、500强动态、营销动作、营销热点与创业机会六大板块。
          打开本文档即表示同意：数据来源于公开渠道，仅供参考。
        </p>
      </div>
      <div class="card">
        <div class="section-title" style="font-size:16px;margin-bottom:6px">📡 数据源</div>
        <div class="about-row"><span class="k">正常源</span><span class="v ok">${(src.ok || []).join('、')}</span></div>
        ${failed}
        <div class="about-row"><span class="k">数据更新时间</span><span class="v">${fmtTime(DATA.updatedAt)}</span></div>
        <div class="about-row"><span class="k">下次更新</span><span class="v">${nextUpdateText()}</span></div>
      </div>`;
  }

  function render() {
    const hash = location.hash.replace(/^#\//, '') || 'home';
    if (hash === 'home') view.innerHTML = renderHome();
    else if (hash === 'about') view.innerHTML = renderAbout();
    else if (SECTIONS[hash]) view.innerHTML = renderSectionView(hash);
    else view.innerHTML = renderHome();
    $('#topTime').textContent = DATA ? `更新于 ${fmtTime(DATA.updatedAt)}` : '';
    setActiveNav(hash);
  }

  function setActiveNav(hash) {
    document.querySelectorAll('.nav-item[data-view]').forEach((el) => {
      el.classList.toggle('active', el.dataset.view === hash);
    });
  }

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }
  let toastTimer;
  function toast(msg) {
    let t = $('#toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------- 抽屉 ---------- */
  function openDrawer() {
    $('#drawer').classList.add('open');
    $('#overlay').classList.remove('hidden');
  }
  function closeDrawer() {
    $('#drawer').classList.remove('open');
    $('#overlay').classList.add('hidden');
  }
  $('#menuBtn').addEventListener('click', openDrawer);
  $('#overlay').addEventListener('click', closeDrawer);
  document.querySelectorAll('.drawer-nav a, .drawer-foot a').forEach((a) => {
    a.addEventListener('click', closeDrawer);
  });

  /* ---------- 刷新 ---------- */
  async function refresh() {
    const btn = $('#refreshBtn');
    btn.classList.add('spin');
    await loadData(true);
    setTimeout(() => btn.classList.remove('spin'), 600);
  }
  $('#refreshBtn').addEventListener('click', refresh);

  /* ---------- 下拉刷新 ---------- */
  (() => {
    const main = $('#main');
    let startY = 0, pulling = false;
    main.addEventListener('touchstart', (e) => {
      if (window.scrollY <= 0) { startY = e.touches[0].clientY; pulling = true; }
    }, { passive: true });
    main.addEventListener('touchmove', (e) => {
      if (!pulling) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 8 && window.scrollY <= 0) {
        e.preventDefault();
        $('#pullHint').classList.add('show');
      }
    }, { passive: false });
    main.addEventListener('touchend', () => {
      if (pulling && $('#pullHint').classList.contains('show')) {
        $('#pullHint').classList.remove('show');
        refresh();
      }
      pulling = false;
    });
  })();

  /* ---------- 路由 ---------- */
  window.addEventListener('hashchange', render);

  /* ---------- Service Worker ---------- */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  /* ---------- 回到前台 / 重新打开时自动刷新 ---------- */
  let lastAutoRefresh = 0;
  function autoRefresh() {
    const now = Date.now();
    if (now - lastAutoRefresh < 20000) return; // 防抖：20 秒内不重复刷新
    lastAutoRefresh = now;
    loadData(true); // 静默刷新到最新数据（在线拿最新，离线用缓存）
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') autoRefresh();
  });
  window.addEventListener('focus', autoRefresh);
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) autoRefresh(); // 从浏览器缓存恢复时也刷新
  });

  /* ---------- 启动 ---------- */
  loadData();
})();
