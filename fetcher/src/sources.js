// sources.js —— 数据源清单 + 关键词规则
// 每个源失败都会被单独捕获跳过，不影响其它源。

export const SOURCES = [
  // ---------- AI / 科技 ----------
  {
    id: 'qbitai',
    name: '量子位',
    url: 'https://www.qbitai.com/feed',
    kind: 'rss',
    prefer: ['aiNews'],
  },
  {
    id: 'ithome',
    name: 'IT之家',
    url: 'https://www.ithome.com/rss/',
    kind: 'rss',
    prefer: ['aiNews', 'hotTopics'],
  },
  {
    id: 'ifanr',
    name: '爱范儿',
    url: 'https://www.ifanr.com/feed',
    kind: 'rss',
    prefer: ['aiNews', 'hotTopics'],
  },
  {
    id: 'geekpark',
    name: '极客公园',
    url: 'https://www.geekpark.net/rss',
    kind: 'rss',
    prefer: ['aiNews'],
  },
  {
    id: 'tmtpost',
    name: '钛媒体',
    url: 'https://www.tmtpost.com/rss',
    kind: 'rss',
    prefer: ['industryInvest', 'aiNews'],
  },
  {
    id: 'leiphone',
    name: '雷锋网',
    url: 'https://www.leiphone.com/feed',
    kind: 'rss',
    prefer: ['aiNews'],
  },
  {
    id: 'sspai',
    name: '少数派',
    url: 'https://sspai.com/feed',
    kind: 'rss',
    prefer: ['aiNews', 'hotTopics'],
  },
  // ---------- 财经 / 投资 / 创业 ----------
  {
    id: 'sina_fin',
    name: '新浪财经',
    url: 'https://rss.sina.com.cn/finance/rollnews.xml',
    kind: 'rss',
    prefer: ['industryInvest'],
  },
  {
    id: 'sina_tech',
    name: '新浪科技',
    url: 'https://rss.sina.com.cn/tech/rollnews.xml',
    kind: 'rss',
    prefer: ['aiNews', 'industryInvest'],
  },
  {
    id: 'cyzone',
    name: '创业邦',
    url: 'https://www.cyzone.cn/rss/',
    kind: 'rss',
    prefer: ['startup', 'industryInvest'],
  },
  // ---------- 营销 / 品牌 ----------
  {
    id: 'digitaling',
    name: '数英网',
    url: 'https://www.digitaling.com/rss',
    kind: 'rss',
    prefer: ['marketing'],
  },
];

// 中国 500 强重点关注企业名单（可自行增删；命中即归入"500强动态"板块）
export const TOP500 = [
  '华为', '腾讯', '阿里巴巴', '阿里', '京东', '字节跳动', '字节', '小米', '比亚迪',
  '宁德时代', '美的', '格力', '海尔', 'TCL', '联想', 'vivo', 'OPPO', '荣耀', '中兴',
  '海康威视', '大疆', '京东方', '隆基', '中国平安', '招商银行', '工商银行', '建设银行',
  '农业银行', '中国银行', '交通银行', '中石油', '中石化', '中海油', '国家电网', '南方电网',
  '中国移动', '中国电信', '中国联通', '顺丰', '美团', '百度', '网易', '拼多多', 'TikTok',
  '蔚来', '理想', '小鹏', '五粮液', '贵州茅台', '茅台', '农夫山泉', '伊利', '蒙牛',
  '新希望', '牧原', '万华化学', '恒力', '中国建筑', '中国中铁', '中国铁建', '中国中车',
];

// 板块关键词规则（命中任一即进入该板块）
export const KEYWORDS = {
  aiNews: [
    '大模型', 'OpenAI', 'GPT', 'ChatGPT', 'Claude', 'Gemini', 'Llama', 'DeepSeek',
    '人工智能', '智谱', '文心', '通义', 'Kimi', '豆包', '混元', 'AGI', '多模态',
    'AI 芯片', 'AI芯片', '英伟达', 'NVIDIA', 'GPU', '算力', 'AIGC', '智能体', 'Agent',
  ],
  industryInvest: [
    '融资', '获投', '完成.*轮', 'Pre-A', 'A轮', 'B轮', 'C轮', 'D轮', '天使轮',
    '战略投资', '股权投资', '并购', '收购', 'IPO', '上市', '估值', '募资', '募得',
    '投资机构', '领投', '跟投', '出资', '资本',
  ],
  marketing: [
    '营销', '广告', '品牌', '代言', '联名', '新品', '发布', '上市', '种草', '达人',
    'KOL', 'KOC', '直播', '短视频', '跨界', '合作', '推广', 'campaign', 'Campaign',
    '爆款', '官宣', '焕新', '首发', '联乘',
  ],
  startup: [
    '创业', '机会', '赛道', '蓝海', '增长', '新消费', '新品牌', '出海', '跨境电商',
    '商业模式', '风口', '市场机会',
  ],
};

// 营销动作细分子类的关键词
export const MARKETING_SUB = {
  newProducts: ['新品', '发布', '上市', '首发', '焕新', '官宣'],
  influencerVideos: ['达人', 'KOL', 'KOC', '爆款', '种草', '直播', '短视频', '带货'],
  crossCollab: ['联名', '跨界', '联乘', '合作', '联名款'],
};

// 每个板块最多保留的条数
export const SECTION_LIMITS = {
  aiNews: 20,
  industryInvest: 20,
  top500: 15,
  newProducts: 12,
  influencerVideos: 12,
  crossCollab: 12,
  hotTopics: 15,
  startup: 15,
};
