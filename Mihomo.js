// Mihomo 覆写脚本（Clash Verge Rev「编辑脚本」/ Mihomo Party「覆写-脚本」）
// 保留订阅自带的 proxies，注入策略组、规则、DNS、嗅探、TUN

const ICON = "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/icon/qure/color/";
const EXCLUDE = "(?i)GB|Traffic|Expire|Premium|频道|订阅|ISP|流量|到期|重置";

// 区域自动测速组共用模板
const region = (name, icon, filter, extra = {}) => ({
  name,
  icon: ICON + icon,
  type: "url-test",
  interval: 300,
  "include-all": true,
  "exclude-filter": EXCLUDE + "|免费",
  filter,
  ...extra,
});

const proxyGroups = [
  {
    name: "PROXY",
    icon: "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/icon/qure/color/Proxy.png",
    type: "select",
    "include-all": false,
    proxies: ["AUTO", "SELECT", "JP", "HK", "TW", "SG", "US"],
  },
  { name: "SELECT", icon: ICON + "Final.png", type: "select", "include-all": true, "exclude-filter": EXCLUDE },
  { name: "AUTO", icon: ICON + "Auto.png", type: "url-test", "include-all": true, "exclude-filter": EXCLUDE, interval: 300 },
  { name: "AIGC", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ChatGPT.png", type: "select", proxies: ["JP", "PROXY", "SG", "US", "SELECT"] },
  { name: "Telegram", icon: ICON + "Telegram.png", type: "select", proxies: ["PROXY", "AUTO", "JP", "HK", "TW", "SG", "US"] },
  { name: "AppleTV", icon: ICON + "Apple_TV.png", type: "select", proxies: ["PROXY", "AUTO", "DIRECT", "JP", "HK", "TW", "SG", "US"] },
  { name: "Apple", icon: ICON + "Apple.png", type: "select", proxies: ["DIRECT", "AUTO", "PROXY", "HK", "TW", "SG", "JP"] },
  { name: "AppleMusic", icon: ICON + "Apple_Music.png", type: "select", proxies: ["PROXY", "AUTO", "DIRECT", "JP", "HK", "TW", "SG", "US"] },
  { name: "iCloud", icon: ICON + "iCloud.png", type: "select", proxies: ["DIRECT", "AUTO", "PROXY", "HK", "TW", "SG", "JP"] },
  { name: "Steam", icon: ICON + "Steam.png", type: "select", proxies: ["PROXY", "AUTO", "DIRECT", "JP", "HK", "TW", "SG"] },
  { name: "YouTube", icon: ICON + "YouTube.png", type: "select", proxies: ["PROXY", "JP", "AUTO", "SG", "HK", "TW", "US"] },
  { name: "Google", icon: ICON + "Google.png", type: "select", proxies: ["PROXY", "AUTO", "SELECT", "JP", "HK", "TW", "SG", "US"] },
  { name: "Spotify", icon: ICON + "Spotify.png", type: "select", proxies: ["PROXY", "AUTO", "DIRECT", "SELECT", "JP", "HK", "TW", "SG", "US"] },
  { name: "GitHub", icon: ICON + "GitHub.png", type: "select", proxies: ["JP", "AUTO", "PROXY", "SELECT", "DIRECT", "HK", "TW", "SG", "US"] },
  { name: "AD", icon: ICON + "AdWhite.png", type: "select", proxies: ["REJECT", "DIRECT", "AUTO", "SELECT", "PROXY"] },
  { name: "GLOBAL", icon: ICON + "Global.png", type: "select", proxies: ["PROXY", "AUTO", "JP", "SELECT", "DIRECT", "HK", "TW", "SG"] },
  region("HK", "Hong_Kong.png", "(?i)港|HK|hk|Hong Kong|HongKong|hongkong"),
  region("TW", "Taiwan.png", "(?i)台|新北|彰化|TW|Taiwan", { tolerance: 50 }),
  region("SG", "Singapore.png", "(?i)新加坡|坡|狮城|SG|Singapore"),
  region("JP", "Japan.png", "(?i)日本|川日|东京|大阪|泉日|埼玉|沪日|深日|JP|Japan"),
  region("US", "United_States.png", "(?i)美国|USA|🇺🇸"),
];

// 规则集：原始链接 + jsDelivr 链接，统一 classical/yaml/86400
const CDN = "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/";
const providerUrls = {
  advertising: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Advertising/Advertising_Classical.yaml",
  privacy: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Privacy/Privacy_Classical.yaml",
  telegram: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Telegram/Telegram.yaml",
  google: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Google/Google.yaml",
  apple_tv: "AppleTV/AppleTV.yaml",
  apple: "Apple/Apple_Classical.yaml",
  apple_music: "AppleMusic/AppleMusic.yaml",
  icloud: "iCloud/iCloud.yaml",
  bing: "Bing/Bing.yaml",
  copilot: "Copilot/Copilot.yaml",
  claude: "Claude/Claude.yaml",
  openai: "OpenAI/OpenAI.yaml",
  gemini: "Gemini/Gemini.yaml",
  steam: "Steam/Steam.yaml",
  steam_cn: "SteamCN/SteamCN.yaml",
  youtube: "YouTube/YouTube.yaml",
  china: "ChinaMax/ChinaMax_Classical.yaml",
  twitch: "Twitch/Twitch.yaml",
  twitter: "Twitter/Twitter.yaml",
  reddit: "Reddit/Reddit.yaml",
  riot: "Riot/Riot.yaml",
  spotify: "Spotify/Spotify.yaml",
  github: "GitHub/GitHub.yaml",
  bilibili: "BiliBili/BiliBili.yaml",
};

const ruleProviders = Object.fromEntries(
  Object.entries(providerUrls).map(([key, url]) => [
    key,
    { url: url.startsWith("https://") ? url : CDN + url, path: `./ruleset/${key}.yaml`, behavior: "classical", interval: 86400, format: "yaml", type: "http" },
  ])
);

// [规则集, 策略]，按匹配顺序排列，最后追加 MATCH,GLOBAL
const rules = [
  ["advertising", "AD"],
  ["privacy", "DIRECT"],
  ["copilot", "AIGC"],
  ["openai", "AIGC"],
  ["claude", "AIGC"],
  ["gemini", "AIGC"],
  ["apple_tv", "AppleTV"],
  ["apple_music", "AppleMusic"],
  ["icloud", "iCloud"],
  ["apple", "Apple"],
  ["steam_cn", "DIRECT"],
  ["steam", "Steam"],
  ["youtube", "YouTube"],
  ["telegram", "Telegram"],
  ["google", "Google"],
  ["china", "DIRECT"],
  ["spotify", "Spotify"],
  ["riot", "PROXY"],
  ["reddit", "PROXY"],
  ["twitter", "PROXY"],
  ["twitch", "PROXY"],
  ["github", "GitHub"],
  ["bilibili", "DIRECT"],
].map(([key, policy]) => `RULE-SET,${key},${policy}`);

const dns = {
  enable: true,
  "prefer-h3": true,
  ipv6: false,
  "enhanced-mode": "fake-ip",
  "respect-rules": true,
  nameserver: ["https://223.5.5.5/dns-query", "https://doh.pub/dns-query"],
  "proxy-server-nameserver": ["https://223.5.5.5/dns-query", "https://doh.pub/dns-query"],
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter": [
    "+.m2m",
    "+.injections.adguard.org",
    "+.local.adguard.org",
    "+.bogon",
    "+.lan",
    "+.localdomain",
    "+.home.arpa",
    "+.10.in-addr.arpa", "+.16.172.in-addr.arpa", "+.17.172.in-addr.arpa", "+.18.172.in-addr.arpa",
    "+.19.172.in-addr.arpa", "+.20.172.in-addr.arpa", "+.21.172.in-addr.arpa", "+.22.172.in-addr.arpa",
    "+.23.172.in-addr.arpa", "+.24.172.in-addr.arpa", "+.25.172.in-addr.arpa", "+.26.172.in-addr.arpa",
    "+.27.172.in-addr.arpa", "+.28.172.in-addr.arpa", "+.29.172.in-addr.arpa", "+.30.172.in-addr.arpa",
    "+.31.172.in-addr.arpa", "+.168.192.in-addr.arpa", "+.254.169.in-addr.arpa",
    "dns.msftncsi.com",
    "*.srv.nintendo.net",
    "*.stun.playstation.net",
    "xbox.*.microsoft.com",
    "*.xboxlive.com",
    "*.turn.twilio.com",
    "*.stun.twilio.com",
    "stun.syncthing.net",
    "stun.*",
  ],
};

const sniffer = {
  enable: true,
  sniff: {
    HTTP: { ports: [80, "8080-8880"], "override-destination": true },
    TLS: { ports: [443, 8443] },
    QUIC: { ports: [443, 8443] },
  },
  "skip-domain": ["Mijia Cloud", "+.push.apple.com"],
};

const tun = {
  enable: true,
  stack: "system",
  device: "Ethernet 99",
  "auto-route": true,
  "auto-detect-interface": true,
  "dns-hijack": ["any:53", "tcp://any:53"],
  "strict-route": true,
  mtu: 1500,
};

function main(config) {
  config["proxy-groups"] = proxyGroups;
  config["rule-providers"] = ruleProviders;
  config.rules = [...rules, "MATCH,GLOBAL"];
  Object.assign(config, { dns, sniffer, tun });
  return config;
}
