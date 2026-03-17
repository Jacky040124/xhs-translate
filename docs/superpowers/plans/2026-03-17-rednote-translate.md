# RedNote Translate 实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个像素级复刻 Kagi Translate 的小红书体翻译器网站

**Architecture:** Next.js App Router 全栈应用，前端负责界面交互，API Route 调用 DeepSeek 完成翻译，Vercel 部署

**Tech Stack:** Next.js 14+, Tailwind CSS, DeepSeek API, Vercel

---

## 文件结构

```
rednote-translate/
├── app/
│   ├── layout.tsx              # 根布局，字体、metadata
│   ├── page.tsx                # 主页面，翻译器界面
│   ├── globals.css             # Tailwind 基础样式
│   └── api/
│       └── translate/
│           └── route.ts        # POST 翻译接口
├── components/
│   ├── Translator.tsx          # 翻译器主组件
│   ├── TextArea.tsx            # 输入/输出文本框
│   ├── Selector.tsx            # 下拉选择器
│   └── CopyButton.tsx          # 复制按钮
├── lib/
│   ├── prompts.ts              # 6 种风格的 system prompt
│   └── deepseek.ts             # DeepSeek API 封装
├── .env.local                  # API Key（不提交）
├── .env.example                # 环境变量模板
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`, `tailwind.config.ts`, `tsconfig.json`, `next.config.ts`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `.env.example`, `.gitignore`

- [ ] **Step 1: 创建 Next.js 项目**

```bash
cd ~/Desktop/rednote-translate
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

选择：
- Would you like to use Turbopack? → No

- [ ] **Step 2: 验证项目创建成功**

```bash
npm run dev
```

Expected: 浏览器访问 http://localhost:3000 看到 Next.js 默认页面

- [ ] **Step 3: 创建环境变量模板**

创建 `.env.example`:
```
DEEPSEEK_API_KEY=sk-your-api-key-here
```

- [ ] **Step 4: 更新 .gitignore**

确保 `.gitignore` 包含:
```
.env.local
.env
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: initialize Next.js project with Tailwind"
```

---

## Task 2: DeepSeek API 封装

**Files:**
- Create: `lib/deepseek.ts`

- [ ] **Step 1: 创建 lib 目录和 deepseek.ts**

创建 `lib/deepseek.ts`:
```typescript
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface TranslateOptions {
  text: string;
  systemPrompt: string;
}

interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function translate({ text, systemPrompt }: TranslateOptions): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data: DeepSeekResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/deepseek.ts
git commit -m "feat: add DeepSeek API wrapper"
```

---

## Task 3: 风格 Prompts

**Files:**
- Create: `lib/prompts.ts`

- [ ] **Step 1: 创建 prompts.ts**

创建 `lib/prompts.ts`:
```typescript
export interface StyleOption {
  id: string;
  name: string;
  emoji: string;
  prompt: string;
}

export const styles: StyleOption[] = [
  {
    id: "standard",
    name: "标准小红书体",
    emoji: "📕",
    prompt: `你是一个小红书文案翻译器。把用户输入的普通文字翻译成典型的小红书风格。

特点：
- 大量使用emoji（每句话至少1-2个相关emoji）
- 夸张表达：绝绝子、yyds、真的会谢、DNA动了、谁懂啊、救命、无语子
- 称呼：姐妹们、宝子们、家人们
- 感叹号多用！！！
- 适当换行增加可读性
- 结尾加3-5个相关 #标签

直接输出翻译结果，不要解释。`,
  },
  {
    id: "zhongcao",
    name: "种草体",
    emoji: "🛍️",
    prompt: `你是一个小红书种草文案翻译器。把用户输入的内容翻译成种草安利风格。

特点：
- 强调"必买"、"闭眼入"、"回购无数次"
- 使用"姐妹们冲！"、"别犹豫直接买"
- 描述使用感受要夸张：太绝了、爱死了、离不开了
- 多用🔥💯✨💕等emoji
- 结尾加 #好物分享 #必买清单 等标签

直接输出翻译结果，不要解释。`,
  },
  {
    id: "tandian",
    name: "探店体",
    emoji: "🍜",
    prompt: `你是一个小红书探店文案翻译器。把用户输入的内容翻译成探店打卡风格。

特点：
- 开头用📍地点+店名格式
- 描述食物要诱人：入口即化、鲜嫩多汁、一口爆汁
- 环境描述：氛围感拉满、出片率超高、随手一拍都是大片
- 加入人均价格区间
- 结尾：📮地址：xxx / ⏰营业时间：xxx
- 标签：#探店 #美食推荐 #城市名美食

直接输出翻译结果，不要解释。`,
  },
  {
    id: "qinggan",
    name: "情感体",
    emoji: "💔",
    prompt: `你是一个小红书情感文案翻译器。把用户输入的内容翻译成走心情感风格。

特点：
- 文艺、治愈、略带伤感
- 使用"后来才明白"、"原来"、"才发现"句式
- 短句为主，多换行，制造呼吸感
- emoji 用🌙✨🍃💫等意境类
- 可以引用或化用歌词、诗句
- 标签：#情感语录 #扎心文案 #治愈系

直接输出翻译结果，不要解释。`,
  },
  {
    id: "ganhuo",
    name: "干货体",
    emoji: "📚",
    prompt: `你是一个小红书干货文案翻译器。把用户输入的内容翻译成实用干货风格。

特点：
- 开头用"🔥建议收藏！"或"📌码住！"
- 分点列出：1️⃣ 2️⃣ 3️⃣ 或 ✅
- 语言简洁直接，不废话
- 强调"亲测有效"、"踩过的坑"、"血泪教训"
- 结尾："码住慢慢看"、"有用记得点赞收藏"
- 标签：#干货分享 #实用技巧 #涨知识

直接输出翻译结果，不要解释。`,
  },
  {
    id: "xuanfu",
    name: "炫富体",
    emoji: "💎",
    prompt: `你是一个小红书凡尔赛文案翻译器。把用户输入的内容翻译成低调炫耀风格。

特点：
- 假装抱怨实则炫耀："好烦啊又要去马尔代夫了"
- 用"普通"、"随便"、"一般般"修饰奢侈品
- 不经意提到价格或品牌
- 假装困扰："老公非要给我买"、"朋友硬塞给我的"
- emoji用💅✨🥂💎
- 标签：#日常vlog #碎碎念

直接输出翻译结果，不要解释。`,
  },
];

export const inputTypes = [
  { id: "normal", name: "普通话" },
  { id: "formal", name: "书面语" },
  { id: "english", name: "English" },
];

export function getStyleById(id: string): StyleOption | undefined {
  return styles.find((s) => s.id === id);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/prompts.ts
git commit -m "feat: add 6 xiaohongshu style prompts"
```

---

## Task 4: API 路由

**Files:**
- Create: `app/api/translate/route.ts`

- [ ] **Step 1: 创建 API 路由**

创建 `app/api/translate/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { translate } from "@/lib/deepseek";
import { getStyleById } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { text, style } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const styleOption = getStyleById(style || "standard");
    if (!styleOption) {
      return NextResponse.json(
        { error: "Invalid style" },
        { status: 400 }
      );
    }

    const result = await translate({
      text: text.trim(),
      systemPrompt: styleOption.prompt,
    });

    return NextResponse.json({ result, style: styleOption.id });
  } catch (error) {
    console.error("Translate error:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/translate/route.ts
git commit -m "feat: add translate API route"
```

---

## Task 5: UI 组件

**Files:**
- Create: `components/Selector.tsx`
- Create: `components/CopyButton.tsx`
- Create: `components/TextArea.tsx`
- Create: `components/Translator.tsx`

- [ ] **Step 1: 创建 Selector 组件**

创建 `components/Selector.tsx`:
```typescript
"use client";

interface Option {
  id: string;
  name: string;
  emoji?: string;
}

interface SelectorProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function Selector({ options, value, onChange, label }: SelectorProps) {
  return (
    <div className="relative">
      <label className="block text-sm text-gray-500 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.emoji ? `${option.emoji} ${option.name}` : option.name}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-[34px] pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 CopyButton 组件**

创建 `components/CopyButton.tsx`:
```typescript
"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
    >
      {copied ? "已复制 ✓" : "复制"}
    </button>
  );
}
```

- [ ] **Step 3: 创建 TextArea 组件**

创建 `components/TextArea.tsx`:
```typescript
"use client";

interface TextAreaProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function TextArea({ value, onChange, placeholder, readOnly }: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className="w-full h-64 p-4 text-base border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
    />
  );
}
```

- [ ] **Step 4: 创建 Translator 主组件**

创建 `components/Translator.tsx`:
```typescript
"use client";

import { useState } from "react";
import { Selector } from "./Selector";
import { TextArea } from "./TextArea";
import { CopyButton } from "./CopyButton";
import { styles, inputTypes } from "@/lib/prompts";

export function Translator() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [inputType, setInputType] = useState("normal");
  const [style, setStyle] = useState("standard");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutputText("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, style }),
      });

      const data = await response.json();

      if (data.error) {
        setOutputText(`错误: ${data.error}`);
      } else {
        setOutputText(data.result);
      }
    } catch (error) {
      setOutputText("翻译失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <div className="space-y-3">
          <Selector
            label="输入语言"
            options={inputTypes}
            value={inputType}
            onChange={setInputType}
          />
          <TextArea
            value={inputText}
            onChange={setInputText}
            placeholder="输入要翻译的文字..."
          />
          <button
            onClick={handleTranslate}
            disabled={loading || !inputText.trim()}
            className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "翻译中..." : "翻译成小红书体 →"}
          </button>
        </div>

        {/* 输出区域 */}
        <div className="space-y-3">
          <Selector
            label="输出风格"
            options={styles}
            value={style}
            onChange={setStyle}
          />
          <div className="relative">
            <TextArea
              value={outputText}
              placeholder="翻译结果将在这里显示..."
              readOnly
            />
            {outputText && (
              <div className="absolute bottom-3 right-3">
                <CopyButton text={outputText} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/
git commit -m "feat: add UI components"
```

---

## Task 6: 主页面

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: 更新 globals.css**

替换 `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
```

- [ ] **Step 2: 更新 layout.tsx**

替换 `app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RedNote Translate - 小红书体翻译器",
  description: "把普通文字翻译成小红书风格文案",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: 更新 page.tsx**

替换 `app/page.tsx`:
```typescript
import { Translator } from "@/components/Translator";

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📕 RedNote Translate
        </h1>
        <p className="text-gray-500">
          把普通文字翻译成小红书体文案
        </p>
      </div>

      <Translator />

      <footer className="text-center mt-12 text-sm text-gray-400">
        © 2026 RedNote Translate
      </footer>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/
git commit -m "feat: create main page layout"
```

---

## Task 7: 配置 DeepSeek API Key

**Files:**
- Create: `.env.local`

- [ ] **Step 1: 创建 .env.local**

```bash
echo 'DEEPSEEK_API_KEY=你的API密钥' > .env.local
```

注：需要从 https://platform.deepseek.com/ 获取 API Key

- [ ] **Step 2: 验证本地运行**

```bash
npm run dev
```

访问 http://localhost:3000，输入文字测试翻译功能

Expected: 输入文字后点击翻译，能看到小红书风格输出

---

## Task 8: 部署到 Vercel

- [ ] **Step 1: 推送到 GitHub**

```bash
# 创建 GitHub 仓库后
git remote add origin https://github.com/你的用户名/rednote-translate.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Vercel 部署**

1. 访问 https://vercel.com/new
2. 导入 GitHub 仓库
3. 添加环境变量 `DEEPSEEK_API_KEY`
4. 点击 Deploy

- [ ] **Step 3: 验证生产环境**

访问 Vercel 分配的域名，测试翻译功能

Expected: 线上版本功能正常

- [ ] **Step 4: Final Commit**

```bash
git add .
git commit -m "docs: update README with deployment info"
```

---

## 完成标准

- [ ] 界面与 Kagi Translate 布局相似
- [ ] 6 种风格都能正常输出
- [ ] 响应时间 < 5 秒
- [ ] Vercel 部署成功
- [ ] 复制功能正常工作
