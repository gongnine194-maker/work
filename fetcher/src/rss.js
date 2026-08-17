// rss.js —— 零依赖的 RSS 解析器（Node 标准库即可运行）
// 说明：RSS 结构简单，用正则解析足够健壮；解析失败不会抛异常，返回空列表。

function decodeEntities(str = '') {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

// 提取单个标签内容，优先 CDATA，其次普通文本
function extractTag(xml, tag) {
  const cdata = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i').exec(xml);
  if (cdata) return cdata[1];
  const plain = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i').exec(xml);
  return plain ? plain[1] : '';
}

function stripHtml(str = '') {
  return decodeEntities(str)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTitle(str = '') {
  return decodeEntities(str).replace(/\s+/g, ' ').trim();
}

/**
 * 解析 RSS/Atom 文本，返回条目数组
 * @param {string} xml
 * @returns {Array<{title:string, link:string, pubDate:string, description:string}>}
 */
export function parseFeed(xml) {
  const out = [];
  // 兼容 RSS <item> 与 Atom <entry>
  const itemRe = /<item[\s>][\s\S]*?<\/item>|<item>[\s\S]*?<\/item>/gi;
  let m;
  const blocks = [];
  while ((m = itemRe.exec(xml)) !== null) blocks.push(m[0]);
  if (blocks.length === 0) {
    const entryRe = /<entry[\s>][\s\S]*?<\/entry>|<entry>[\s\S]*?<\/entry>/gi;
    while ((m = entryRe.exec(xml)) !== null) blocks.push(m[0]);
  }
  for (const block of blocks) {
    let title = cleanTitle(extractTag(block, 'title'));
    let link = decodeEntities(extractTag(block, 'link'));
    let pubDate = decodeEntities(extractTag(block, 'pubDate'));
    if (!pubDate) pubDate = decodeEntities(extractTag(block, 'updated'));
    let description = stripHtml(extractTag(block, 'description') || extractTag(block, 'summary') || extractTag(block, 'content'));
    // 有些 Atom 的 link 是属性形式 <link href="..."/>
    if (!/^https?:\/\//i.test(link)) {
      const href = /<link[^>]*href="([^"]+)"/i.exec(block);
      if (href) link = decodeEntities(href[1]);
    }
    if (!title && !link) continue;
    if (!pubDate) pubDate = '';
    out.push({ title, link, pubDate, description });
  }
  return out;
}

/**
 * 抓取一个 RSS 源
 * @param {string} url
 * @param {number} timeoutMs
 * @returns {Promise<Array>}
 */
export async function fetchFeed(url, timeoutMs = 20000) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WorkbenchFetcher/1.0; +https://github.com/)' },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return parseFeed(text);
}
