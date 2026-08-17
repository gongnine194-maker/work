// output.js —— 写数据文件：data/latest.json + 历史归档（保留最近 30 份）
import { writeFileSync, mkdirSync, readdirSync, unlinkSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DATA_DIR = join(ROOT, 'data');
export const HISTORY_DIR = join(DATA_DIR, 'history');

export function writeData(payload) {
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(HISTORY_DIR, { recursive: true });

  writeFileSync(join(DATA_DIR, 'latest.json'), JSON.stringify(payload, null, 2), 'utf8');

  const stamp = payload.updatedAt.replace(/[^0-9]/g, '').slice(0, 12); // YYYYMMDDHHMM
  writeFileSync(join(HISTORY_DIR, `${stamp}.json`), JSON.stringify(payload, null, 2), 'utf8');

  // 清理：只保留最近 30 份历史
  const files = readdirSync(HISTORY_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();
  while (files.length > 30) {
    const old = files.shift();
    unlinkSync(join(HISTORY_DIR, old));
  }
}

export function readManual() {
  const p = join(ROOT, 'fetcher', 'manual', 'manual.json');
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}
