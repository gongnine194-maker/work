# 智讯工作台 📱

适配安卓手机的资讯工作台 App（PWA），每天 **08:00 / 20:00（北京时间）** 自动抓取：

- 🤖 **AI 大模型热点**：大模型、AI 行业动态
- 💰 **行业投资动态**：各行业融资、并购、IPO
- 🏢 **500强融资投资**：中国 500 强重点企业动态（含华为、腾讯、阿里、比亚迪、宁德时代等名单，可自行增删）
- 📦 **新品上市** / 🎬 **达人合作爆款** / 🤝 **跨界合作**（全平台营销动作）
- 🔥 **营销热点** / 🚀 **创业机会**

界面为淡蓝色主题 + 左侧导航抽屉，支持离线缓存、下拉刷新。数据托管在 GitHub，**平时使用完全不需要电脑**。

---

## 一、环境要求（你需要准备的）

| 项目 | 说明 |
|---|---|
| 电脑 | ✅ 什么都不用装（Node 已就绪，本项目零依赖） |
| GitHub 账号 | ⚠️ **需要**（免费注册 https://github.com/signup ），用于托管数据 + 定时任务 |
| 手机 | 安卓 Chrome 浏览器（系统自带或安装），无需其它 |

---

## 二、一次性配置（约 10 分钟，只在首次做一次）

### 1. 创建 GitHub 仓库并推送

在 GitHub 网页上新建一个仓库（建议命名 `work`，**选 Public 公开**，不要勾选 README），然后在电脑终端执行：

```bash
cd /Users/ninegong/Documents/kimi/workspace/workbench-app
git init
git add -A
git commit -m "init: 智讯工作台 v1"
git branch -M main
git remote add origin https://github.com/gongnine194-maker/work.git
git push -u origin main
```

### 2. 开启 GitHub Pages

仓库页面 → **Settings（设置）** → 左侧 **Pages** → **Build and deployment**：
- Source 选 **Deploy from a branch**
- Branch 选 **main**，目录选 **/ (root)** → Save

等 1~2 分钟，你的 App 就上线了，地址是：

```
https://gongnine194-maker.github.io/work/app/
```

> 第一次可以先在电脑浏览器打开确认能显示，再装到手机。

### 3. 立即触发第一次抓取

仓库页面 → **Actions** → 左侧 **每日数据更新** → 右侧 **Run workflow** → 绿色按钮运行。
（以后每天 08:00 / 20:00 会自动运行，无需手动。）

---

## 三、手机安装（装一次，之后像普通 App 一样用）

1. 手机 Chrome 打开上面的网址；
2. 右上角菜单 `⋮` → **添加到主屏幕**（部分机型叫"安装应用"）；
3. 桌面就会出现"智讯工作台"图标，点开即全屏使用。

之后**不用连电脑、不用开电脑**：每天早上 8 点和晚上 8 点，GitHub 自动抓取新数据，你打开 App 下拉刷新（或点右上角刷新按钮）即可看到最新内容；没网时也能看最近一次的数据。

---

## 四、手动补充内容（可选，推荐）

自动抓的是公开 RSS 源，某些板块（如"达人合作爆款"）可能内容偏少。你可以手动补充任何想看的资讯：

编辑 `fetcher/manual/manual.json`，按板块填条目（会置顶显示并带"手动补充"标记）：

```json
{
  "aiNews": [
    {
      "title": "示例：某大模型发布新版本",
      "summary": "一句话摘要",
      "url": "https://example.com",
      "source": "手动补充",
      "publishedAt": "2025-08-14T08:00:00+08:00"
    }
  ]
}
```

保存后推送到 GitHub（或直接在 GitHub 网页上编辑该文件），下一次定时抓取会自动合并进去。板块键名：`aiNews` / `industryInvest` / `top500` / `newProducts` / `influencerVideos` / `crossCollab` / `hotTopics` / `startup`。

---

## 五、常用调整

| 想改什么 | 改哪里 |
|---|---|
| 更新时间（如改 9:00/21:00） | `.github/workflows/update.yml` 里的 cron（UTC 时间，北京时间 -8） |
| 500强关注名单 | `fetcher/src/sources.js` 里的 `TOP500` 数组 |
| 板块关键词（分类规则） | `fetcher/src/sources.js` 里的 `KEYWORDS` |
| 数据源列表 | `fetcher/src/sources.js` 里的 `SOURCES` |
| 界面颜色 / 文案 | `app/style.css`（顶部 `:root` 变量）/ `app/index.html` |

改完推送即可，不需要在电脑上跑任何服务。

本地预览（可选）：`cd workbench-app && python3 -m http.server 8899`，浏览器打开 `http://127.0.0.1:8899/app/`。

本地手动抓取（可选）：`node fetcher/src/index.js`，会重新生成 `data/latest.json`。

---

## 六、已知说明与限制

- **数据源**：当前接入 11 个公开 RSS 源（新浪科技/财经、量子位、IT之家、爱范儿、极客公园、钛媒体、雷锋网、少数派、创业邦、数英网）。某个源失效会自动跳过并在"关于"页显示，不影响整体。
- **微博/抖音/小红书等平台**：无公开 API 且抓取违反平台条款、极不稳定，未纳入自动抓取；这类内容请用 `manual.json` 手动补充。
- **GitHub Actions 定时**：免费版定时任务可能有几分钟到几十分钟的延迟，且依赖仓库有活动；偶尔漏跑可手动 Run workflow。
- **公开仓库**：GitHub Pages 免费版要求仓库公开（隐私仓库需要付费版）。如果介意数据公开，可只公开数据、或后续迁移到自建服务器。
- 本应用为个人工作台，数据来自公开渠道，仅供参考。

---

## 目录结构

```
workbench-app/
├── app/                      # PWA 前端（淡蓝色 + 左侧导航）
│   ├── index.html / style.css / app.js / sw.js / manifest.webmanifest
│   └── icons/                # 应用图标
├── fetcher/                  # 数据抓取器（零依赖）
│   ├── src/                  # sources.js（源/关键词/500强名单）、rss.js、classify.js、index.js
│   └── manual/manual.json    # 手动补充内容
├── data/                     # 抓取生成的数据（latest.json + 历史归档）
├── scripts/gen-icons.js      # 图标生成脚本
└── .github/workflows/update.yml  # 每天 08:00/20:00 定时抓取
```
