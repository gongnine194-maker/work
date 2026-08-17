// index.js —— 抓取主程序
// 运行：node fetcher/index.js
// 流程：抓取所有 RSS 源 → 解析 → 分类 → 合并手动内容 → 写 data/latest.json + 历史归档
import { SOURCES, SECTION_LIMITS } from './sources.js';
import { fetchFeed } from './rss.js';
import { classify, marketingSubs } from './classify.js';
import { writeData, readManual } from './output.js';

const MAX_ITEMS_PER_SOURCE = 25;

function cnTime() {
  // 输出北京时间（UTC+8）的 ISO 字符串
  const now = new Date();
  const iso = new Date(now.getTime() + 8 * 3600 * 1000).toISOString().replace('Z', '+08:00');
  return iso;
}

function summarize(desc) {
  if (!desc) return '';
  const s = desc.slice(0, 140);
  return s.length < desc.length ? `${s}…` : s;
}

function normalizeTitle(t) {
  return (t || '').replace(/[\s\u3000\p{P}]/gu, '').toLowerCase();
}

export async function run() {
  const okSources = [];
  const failedSources = [];
  const allItems = [];

  await Promise.all(
    SOURCES.map(async (src) => {
      try {
        const entries = await fetchFeed(src.url);
        const items = entries.slice(0, MAX_ITEMS_PER_SOURCE).map((e, i) => ({
          id: `${src.id}-${i}-${Date.now()}`,
          title: e.title,
          summary: summarize(e.description),
          url: e.link,
          source: src.name,
          sourceId: src.id,
          publishedAt: e.pubDate || cnTime(),
          prefer: src.prefer || [],
        }));
        if (items.length === 0) throw new Error('feed empty');
        allItems.push(...items);
        okSources.push(src.name);
      } catch (err) {
        failedSources.push(`${src.name}（${err.message || '解析失败'}）`);
      }
    }),
  );

  // 去重（按标题）
  const seen = new Set();
  const unique = [];
  for (const it of allItems) {
    const key = normalizeTitle(it.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(it);
  }

  // 分类：prefer 源直接进对应板块，其余靠关键词
  const bucket = Object.fromEntries(Object.keys(SECTION_LIMITS).map((k) => [k, []]));
  for (const it of unique) {
    classify(it);
    const tagSet = new Set(it.prefer.filter((p) => bucket[p] !== undefined));
    it.tags.forEach((t) => {
      if (bucket[t] !== undefined) tagSet.add(t);
    });
    if (it.prefer.includes('marketing') || it.tags.includes('marketing')) {
      marketingSubs(it).forEach((s) => tagSet.add(s));
    }
    for (const t of tagSet) bucket[t].push(it);
  }

  // 手动补充内容（curated 置顶）
  const manual = readManual();
  if (manual) {
    for (const [sec, items] of Object.entries(manual)) {
      if (!bucket[sec]) continue;
      const curated = (items || []).map((m, i) => ({
        id: `manual-${sec}-${i}`,
        title: m.title,
        summary: m.summary || '',
        url: m.url || '',
        source: m.source || '手动补充',
        publishedAt: m.publishedAt || cnTime(),
        curated: true,
        tags: [sec],
      }));
      bucket[sec] = [...curated, ...bucket[sec]];
    }
  }

  // 截断 + 排序（按时间倒序，无法解析时间的排后面）
  for (const sec of Object.keys(bucket)) {
    bucket[sec] = bucket[sec]
      .sort((a, b) => {
        const ta = Date.parse(a.publishedAt) || 0;
        const tb = Date.parse(b.publishedAt) || 0;
        return tb - ta;
      })
      .slice(0, SECTION_LIMITS[sec]);
  }

  const payload = {
    app: '智讯工作台',
    version: 1,
    updatedAt: cnTime(),
    sections: bucket,
    sources: { ok: okSources, failed: failedSources },
  };

  writeData(payload);

  const total = Object.values(bucket).reduce((s, a) => s + a.length, 0);
  console.log(`✔ 完成：共 ${unique.length} 条去重条目，${total} 条入库`);
  console.log(`  成功源(${okSources.length})：${okSources.join('、')}`);
  if (failedSources.length) console.log(`  ⚠ 失败源(${failedSources.length})：${failedSources.join('、')}`);
  return payload;
}

// 直接运行时执行
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  run().catch((err) => {
    console.error('✖ 抓取失败：', err);
    process.exit(1);
  });
}
