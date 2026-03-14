# Muslim Pro 复刻 Checklist — 区块对接指南

按 Muslim Pro 网站/App 的信息架构，列出每个区块要接的 Aqala 接口及对接方式。

---

## 1. 导航栏 (Navbar)

| 项目 | 对接内容 | 对接方式 |
|------|----------|----------|
| Logo | 品牌入口 | `href="/"` 或 `href="/app"`（landing 用 `/`，app 内用 `/app`） |
| Features | 功能入口 | 锚点或链接：`#features` / `/prayers` / `/listen` / `/rooms` |
| Blog | 博客（可选） | `/blog`（后续接 Contentful） |
| Sign In | 登录 | `href="/auth/login"` |
| Download / Open App | 主 CTA | `href="/listen"` 或 `href="/app"` |

```tsx
// 示例
<Link href="/auth/login">Sign In</Link>
<Link href="/listen" className="btn-primary">Open Aqala</Link>
```

---

## 2. Hero 区域

| 项目 | 对接内容 | 对接方式 |
|------|----------|----------|
| 主标题 | 静态文案 | 原创文案，如 "Your Islamic App Companion" |
| 副标题 | 静态文案 | 原创描述 |
| 主 CTA 按钮 | 进入听页 | `href="/listen"` 或 `href="/app"` |
| 次要 CTA | 下载 App | 链接到 App Store / Play Store（或 `/app`） |
| 背景图/装饰 | 静态 | 无接口 |

```tsx
<Link href="/listen" className="...">
  Start Listening
</Link>
```

---

## 3. Prayer Times Widget（礼拜时间）

| 项目 | 对接内容 | 对接方式 |
|------|----------|----------|
| 今日礼拜时间 | `PrayerContext` | `usePrayer()` |
| 下一拜名称 + 倒计时 | `nextPrayer`, `timeUntilNext` | `usePrayer()` |
| 位置显示 | `location` | `usePrayer()` |
| 刷新/设置 | `refreshPrayerTimes`, `updateSettings` | `usePrayer()` |

```tsx
// 接入方式
import { usePrayer } from "@/contexts/PrayerContext";

function MuslimProPrayerWidget() {
  const { prayerTimes, nextPrayer, timeUntilNext, loading, location } = usePrayer();

  if (loading || !prayerTimes) return <PrayerSkeleton />;

  return (
    <div>
      <p>{location?.city || "Location"}</p>
      <p>{nextPrayer?.name}</p>
      <p>{timeUntilNext}</p>
      <div>
        <span>Fajr</span><span>{formatTime(prayerTimes.fajr)}</span>
        <span>Dhuhr</span><span>{formatTime(prayerTimes.dhuhr)}</span>
        {/* ... */}
      </div>
    </div>
  );
}
```

**占位阶段**：mock 数据，例如：

```tsx
const MOCK_PRAYER = {
  fajr: new Date(),
  dhuhr: new Date(),
  asr: new Date(),
  maghrib: new Date(),
  isha: new Date(),
};
```

---

## 4. 功能区块 (Features)

| Muslim Pro 区域 | 对应 Aqala 功能 | 对接方式 |
|-----------------|-----------------|----------|
| Prayer Times & Adhan | `/prayers` | `Link href="/prayers"` |
| Quran / Listen | `/listen` | `Link href="/listen"` |
| Ask AI / Q&A | `/listen` 内总结后问答 | 链接到 `/listen`，或说明「在听页内使用」 |
| Community / Rooms | `/rooms` | `Link href="/rooms"` |
| Qibla | `/qibla` | `Link href="/qibla"` |
| 其他功能 | 对应路由 | 见下方路由表 |

```tsx
const FEATURES = [
  { title: "Prayer Times", desc: "...", href: "/prayers" },
  { title: "Live Translation", desc: "...", href: "/listen" },
  { title: "Community", desc: "...", href: "/rooms" },
  { title: "Qibla", desc: "...", href: "/qibla" },
];
```

---

## 5. Trust / Stats 区块

| 项目 | 对接内容 | 对接方式 |
|------|----------|----------|
| 下载量 | 静态或 API | 先写死，如 "Trusted by the community" |
| 评分 | 静态 | 无接口 |
| 奖项 | 静态 | 无接口 |

**可选**：接入 `reviews` 相关 API：

```tsx
// 若有 /api/reviews 或 lib/firebase/reviews
// 可 fetch 评分/数量展示
```

---

## 6. Premium / 订阅区块

| 项目 | 对接内容 | 对接方式 |
|------|----------|----------|
| 是否 Premium | `SubscriptionContext` | `useSubscription()` |
| 去订阅页 | `/subscription` | `Link href="/subscription"` |
| 价格文案 | 静态 | 无接口 |

```tsx
import { useSubscription } from "@/contexts/SubscriptionContext";

function PremiumBanner() {
  const { isPremium } = useSubscription();
  if (isPremium) return null;
  return (
    <Link href="/subscription">Go Premium</Link>
  );
}
```

---

## 7. 用户相关（若 Navbar 显示）

| 项目 | 对接内容 | 对接方式 |
|------|----------|----------|
| 是否登录 | `AuthContext` | `useAuth()` |
| 头像 | `user.photoURL` | `useAuth()` |
| 用户名 | `user.displayName` / `user.username` | `useAuth()` |

```tsx
import { useAuth } from "@/contexts/AuthContext";

function NavUser() {
  const { user, loading } = useAuth();
  if (loading || !user) return <Link href="/auth/login">Sign In</Link>;
  return (
    <Link href={`/user/${user.uid}`}>
      <img src={user.photoURL} alt="" />
      <span>{user.displayName || user.username}</span>
    </Link>
  );
}
```

---

## 8. Footer

| 项目 | 对接内容 | 对接方式 |
|------|----------|----------|
| Privacy | `/privacy` | `Link href="/privacy"` |
| Terms | `/terms` | `Link href="/terms"` |
| About | `/about` | `Link href="/about"` |
| Support | `/support` | `Link href="/support"` |
| Blog | `/blog` | 后续接 Contentful |
| 社交链接 | 静态 | 无接口 |

---

## 9. 路由速查表

| 路径 | 功能 |
|------|------|
| `/` | 首页（当前 Aqala 主入口） |
| `/app` | 若未来 landing 在 `/`，则 app 入口在 `/app` |
| `/listen` | 录音 + 实时翻译 |
| `/prayers` | 礼拜时间 |
| `/prayers/settings` | 礼拜设置 |
| `/qibla` | 朝向 |
| `/rooms` | 房间列表 |
| `/rooms/[roomId]` | 房间详情 + 听讲 |
| `/auth/login` | 登录 |
| `/auth/register` | 注册 |
| `/subscription` | 订阅 |
| `/donate` | 捐赠 |
| `/profile` | 个人页 |
| `/user/[userId]` | 用户主页 |
| `/messages` | 消息 |
| `/muslimpro-demo` | 复刻 demo（新建） |

---

## 10. Context 接入速查

```tsx
// Prayer
import { usePrayer } from "@/contexts/PrayerContext";
const { prayerTimes, nextPrayer, timeUntilNext, loading, location } = usePrayer();

// Auth
import { useAuth } from "@/contexts/AuthContext";
const { user, loading } = useAuth();

// Subscription
import { useSubscription } from "@/contexts/SubscriptionContext";
const { isPremium, showAds } = useSubscription();

// Rooms（若需要房间列表）
import { useRooms } from "@/contexts/RoomsContext";
const { rooms } = useRooms();

// Language（若需要多语言）
import { useLanguage } from "@/contexts/LanguageContext";
const { t, language } = useLanguage();
```

---

## 11. 实施顺序建议

1. **纯 UI 复刻**：用 mock 数据，先完成像素级布局和样式。
2. **Prayer Widget**：接入 `usePrayer()`，替换 mock。
3. **导航链接**：所有 CTA 指向正确路由。
4. **用户/登录**：Navbar 接入 `useAuth()`。
5. **Premium**：若需要，接入 `useSubscription()`。
6. **Blog**：后续单独接 Contentful。

---

## 12. 注意事项

- 复刻放在 `/muslimpro-demo`，不修改现有 layout、header、footer。
- 使用原创文案、图标、配色，避免版权问题。
- 组件需在 `Providers` 内，才能使用 `useAuth`、`usePrayer` 等 Context。
