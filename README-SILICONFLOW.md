# 硅基流动 API 集成说明

## 概述

本文档介绍了如何将硅基流动(Silicon Flow)的 API 集成到 ModelWeb MCP 协议中。这样您可以使用硅基流动的 QwQ-32B 大语言模型来处理 MCP 请求，而不是使用 WebSocket 连接。

## 集成文件

我们创建了以下文件来实现硅基流动 API 集成：

1. **src/lib/SiliconFlowAPI.js** - 硅基流动 API 集成的核心实现
2. **src/components/McpControlPanel.tsx** - 更新的 MCP 控制面板，添加了 API 选择功能
3. **src/lib/mcpWebSocketServer.ts** - 修改后的 WebSocket 服务器，支持硅基流动 API

## 如何使用

在页面中的 MCP 控制面板中，您现在可以选择两种连接方式：

1. **WebSocket** - 传统的 WebSocket 连接方式
2. **硅基流动 API** - 使用硅基流动 API 进行通信

选择"硅基流动 API"选项并点击"Start Server"按钮即可使用硅基流动 API。系统将使用以下配置：

- API URL: `https://api.siliconflow.cn/v1/chat/completions`
- API Key: `sk-rpbdfcumdlwdfssveutdyweficaabukciujbkoltmdsnjiba`
- 模型: `Qwen/QwQ-32B`

## 技术实现

硅基流动 API 集成的关键点：

1. **API 适配器**: 我们实现了一个适配器，它将 MCP 请求转换为硅基流动 API 的格式。

2. **请求处理**: 当用户选择使用硅基流动 API 时，系统会：

   - 修补 MCP WebSocket 服务器的消息处理方法
   - 将 MCP 请求首先交给本地 MCP 服务器处理
   - 然后将相同的请求发送到硅基流动 API
   - 最后将本地处理结果与 API 返回的见解合并

3. **对话历史**: 系统会维护一个对话历史记录，最多保存 10 条消息，以保持上下文连贯性。

4. **错误处理**: 如果 API 调用失败，系统会自动回退到仅使用本地 MCP 服务器处理请求。

## 请求格式

硅基流动 API 请求格式如下：

```json
{
  "model": "Qwen/QwQ-32B",
  "messages": [
    // 历史消息...
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "执行MCP命令：..."
        }
      ]
    }
  ],
  "stream": false,
  "max_tokens": 512,
  "temperature": 0.7,
  "top_p": 0.7,
  "top_k": 50,
  "frequency_penalty": 0.5,
  "n": 1,
  "response_format": {
    "type": "text"
  },
  "tools": [
    {
      "type": "function",
      "function": {
        "description": "Execute MCP command in 3D editor",
        "name": "execute_mcp_command",
        "parameters": {},
        "strict": false
      }
    }
  ]
}
```

## 注意事项

1. **API 密钥安全性**: 在生产环境中，您应该将 API 密钥存储在环境变量或安全的配置文件中，而不是硬编码在代码中。

2. **错误处理**: 如果硅基流动 API 不可用或发生错误，系统会自动回退到本地 MCP 服务器处理，确保基本功能不会中断。

3. **历史记录限制**: 系统会限制对话历史记录的大小，以避免请求过大。

## 进一步改进

可能的未来改进：

1. **API 密钥配置 UI**: 添加用户界面，允许用户配置自己的 API 密钥。

2. **更多模型选择**: 支持选择硅基流动提供的不同模型。

3. **流式响应**: 实现流式(stream)响应支持，提供更快的反馈。

4. **更智能的集成**: 改进 MCP 命令和硅基流动 API 之间的集成，使 AI 更好地理解 3D 编辑操作。
