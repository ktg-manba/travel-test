# TravelTang 功能说明

## 概述

TravelTang 是一个面向海外来华游客的旅游指南网站，提供两个主要付费功能：

1. **PDF 文档下载**
   - 支付宝和微信支付设置指南
   - 中国主要城市旅游攻略

2. **AI 聊天机器人**
   - 24/7 中国旅游答疑服务
   - 使用 AI 提供实时旅游建议

## 已实现的功能

### 1. API 路由

#### PDF 下载 API
- **路径**: `/api/traveltang/download-pdf`
- **方法**: POST
- **参数**: 
  ```json
  {
    "pdf_type": "payment_guide" | "city_guide"
  }
  ```
- **积分消耗**: 10 积分/次
- **返回**: PDF 文件流

#### 聊天机器人 API
- **路径**: `/api/traveltang/chat`
- **方法**: POST
- **参数**: 由 `useChat` hook 自动处理
- **积分消耗**: 5 积分/条消息
- **返回**: 流式响应

### 2. 前端组件

#### PDF 下载组件
- **位置**: `components/traveltang/pdf-download.tsx`
- **功能**: 提供 PDF 下载按钮和界面

#### 聊天机器人组件
- **位置**: `components/traveltang/chatbot.tsx`
- **功能**: 提供聊天界面和消息流式显示

### 3. 产品页面

- **路径**: `/[locale]/traveltang`
- **功能**: 展示 PDF 下载和聊天机器人功能

## 使用说明

### 1. 环境变量配置

确保在 `.env` 文件中配置以下变量：

```env
# OpenAI API (用于聊天机器人)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini  # 可选，默认为 gpt-4o-mini

# Stripe 支付
STRIPE_PRIVATE_KEY=your_stripe_private_key
STRIPE_PUBLIC_KEY=your_stripe_public_key

# 网站 URL
NEXT_PUBLIC_WEB_URL=http://localhost:3000
```

### 2. 积分系统

- PDF 下载：每次消耗 10 积分
- 聊天消息：每条消息消耗 5 积分
- 用户需要先购买套餐才能使用功能

### 3. 访问产品页面

访问 `http://localhost:3000/en/traveltang` 或 `http://localhost:3000/zh/traveltang` 查看产品页面。

## 下一步工作

1. **更新首页内容**
   - 编辑 `i18n/pages/landing/en.json` 和 `i18n/pages/landing/zh.json`
   - 更新品牌名称为 TravelTang
   - 更新功能描述和定价信息

2. **配置定价方案**
   - 在定价页面配置 PDF 套餐和聊天机器人套餐
   - 设置合适的积分数量和价格

3. **自定义 PDF 内容**
   - 编辑 `app/api/traveltang/download-pdf/route.ts`
   - 更新 PDF 生成函数中的内容

4. **优化聊天机器人提示词**
   - 编辑 `app/api/traveltang/chat/route.ts`
   - 更新 `SYSTEM_PROMPT` 以提供更精准的回答

5. **添加更多城市攻略**
   - 在 `generateCityGuidePDF` 函数中添加更多城市信息

## 注意事项

- 确保用户已登录并购买了套餐才能使用功能
- PDF 生成使用 pdfkit 库，确保服务器有足够的内存
- 聊天机器人使用 OpenAI API，需要配置有效的 API Key
- 积分系统会自动扣除积分，请确保用户有足够的积分

