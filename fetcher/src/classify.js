// classify.js —— 关键词分类：把抓到的条目分进各板块
import { TOP500, KEYWORDS, MARKETING_SUB } from './sources.js';

const SECTION_ORDER = ['aiNews', 'industryInvest', 'top500', 'marketing', 'startup'];

function hit(text, words) {
  for (const w of words) {
    try {
      if (new RegExp(w, 'i').test(text)) return true;
    } catch {
      if (text.includes(w)) return true;
    }
  }
  return false;
}

export function classify(item) {
  const haystack = `${item.title} ${item.summary || ''}`;
  const tags = [];
  for (const sec of SECTION_ORDER) {
    if (sec === 'top500') {
      if (TOP500.some((c) => haystack.includes(c))) tags.push('top500');
    } else if (hit(haystack, KEYWORDS[sec])) {
      tags.push(sec);
    }
  }
  item.tags = tags;
  return item;
}

// 把带 marketing 标签的条目细分到三个子板块
export function marketingSubs(item) {
  const haystack = `${item.title} ${item.summary || ''}`;
  const subs = [];
  if (hit(haystack, MARKETING_SUB.newProducts)) subs.push('newProducts');
  if (hit(haystack, MARKETING_SUB.influencerVideos)) subs.push('influencerVideos');
  if (hit(haystack, MARKETING_SUB.crossCollab)) subs.push('crossCollab');
  return subs;
}
