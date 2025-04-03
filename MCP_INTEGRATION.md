# ModelWeb MCP Integration

This document explains how to integrate the Model Context Protocol (MCP) into your ModelWeb 3D editor application.

## What is MCP?

MCP (Model Context Protocol) is a protocol developed by Anthropic that allows Claude and other AI assistants to interact with applications. In this case, we've created a custom MCP implementation that enables AI assistants to control your 3D editor.

## Files Created

We've created the following files for MCP integration:

1. `mcp.mdc` - The MCP protocol specification for your 3D editor
2. `src/lib/mcpServer.ts` - The server-side implementation of the MCP protocol
3. `src/lib/mcpWebSocketServer.ts` - WebSocket server for real-time MCP communications
4. `src/components/McpControlPanel.tsx` - UI component for controlling the MCP server

## Integration Steps

To integrate MCP into your application, follow these steps:

1. First, import the McpControlPanel component in your index.tsx file:

   ```jsx
   import McpControlPanel from "../components/McpControlPanel";
   ```

2. In the left panel section of your app, add the MCP control panel:

   ```jsx
   {
     /* After AdvancedTools component */
   }
   <div className="mt-4 px-2">
     <McpControlPanel
       scene={scene}
       commandHistory={commandHistoryRef.current}
     />
   </div>;
   ```

3. Update your footer to indicate MCP integration:
   ```jsx
   <footer className="bg-gray-800 text-center py-2 text-xs border-t border-gray-700 flex justify-between items-center px-4">
     <div>3D 模型编辑器 - 基于 Three.js 开发</div>
     <div className="text-blue-400">MCP 协议已集成</div>
   </footer>
   ```

## How It Works

1. The MCP control panel allows users to start and stop the MCP server
2. When started, it creates a WebSocket connection for AI assistants to connect to
3. AI assistants can send MCP commands through this connection to control the 3D editor
4. Commands are processed by the mcpServer implementation and applied to the scene
5. All operations are integrated with your existing CommandHistory system for proper undo/redo support

## Available MCP Functions

The protocol supports various functions for:

- Scene management (get scene info, get object info, list objects)
- Object manipulation (create, modify, delete objects)
- Material management (set materials, modify properties)
- History control (undo, redo)
- And more as specified in the mcp.mdc file

## Extending the Protocol

You can extend the protocol by:

1. Adding new function definitions to the mcp.mdc file
2. Implementing the functions in the mcpServer.ts file
3. Updating any related UI components as needed

## Testing MCP Integration

To test your MCP integration:

1. Start your application
2. Open the MCP control panel and start the server
3. Use an MCP-compatible AI assistant to connect to your application
4. Send commands to control the 3D editor

## Troubleshooting

If you encounter issues with MCP integration:

- Check the browser console for error messages
- Verify that the WebSocket connection is established
- Ensure the correct scene and command history are passed to the MCP server
- Validate that AI assistants are sending properly formatted MCP requests
