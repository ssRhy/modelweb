import React, { useState, useEffect } from "react";
import { Scene } from "three";
import { CommandHistory } from "../lib/CommandHistory";
import mcpWebSocketServer from "../lib/mcpWebSocketServer";
import {
  initializeSiliconFlowAPI,
  patchMcpWebSocketServer,
} from "../lib/SiliconFlowAPI";

interface McpControlPanelProps {
  scene: Scene | null;
  commandHistory: CommandHistory;
}

const McpControlPanel: React.FC<McpControlPanelProps> = ({
  scene,
  commandHistory,
}) => {
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState(
    "wss://mcp.anthropic.com/v1/socket"
  );
  const [statusMessage, setStatusMessage] = useState("Server not running");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiType, setApiType] = useState<"websocket" | "siliconflow">(
    "websocket"
  );

  useEffect(() => {
    initializeSiliconFlowAPI();
  }, []);

  useEffect(() => {
    const checkServerStatus = () => {
      const running = mcpWebSocketServer.isRunning();
      setIsServerRunning(running);
      setStatusMessage(
        running ? `Server running (${apiType})` : "Server not running"
      );
    };

    checkServerStatus();

    const intervalId = setInterval(checkServerStatus, 1000);

    return () => clearInterval(intervalId);
  }, [apiType]);

  const handleStartServer = async () => {
    if (!scene) {
      setStatusMessage("Error: No scene available");
      return;
    }

    setStatusMessage(`Starting MCP server (${apiType})...`);

    try {
      mcpWebSocketServer.initialize(scene, commandHistory);

      if (apiType === "siliconflow") {
        patchMcpWebSocketServer(mcpWebSocketServer);
      }

      await mcpWebSocketServer.startClient(
        apiType === "siliconflow"
          ? "https://api.siliconflow.cn/v1/chat/completions"
          : customServerUrl
      );

      setStatusMessage(`MCP server running (${apiType})`);
      setIsServerRunning(true);
    } catch (error) {
      console.error("Failed to start MCP server:", error);
      setStatusMessage(`Error: ${(error as Error).message}`);
    }
  };

  const handleStopServer = () => {
    setStatusMessage("Stopping MCP server...");

    try {
      mcpWebSocketServer.stopClient();

      setStatusMessage("MCP server stopped");
      setIsServerRunning(false);
    } catch (error) {
      console.error("Failed to stop MCP server:", error);
      setStatusMessage(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
      <h3 className="text-lg font-bold mb-2">MCP Server Control</h3>

      <div className="mb-3">
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              isServerRunning ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <p className="text-sm">{statusMessage}</p>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-sm mb-1">API类型:</div>
        <div className="flex space-x-4">
          <label className="flex items-center text-sm">
            <input
              type="radio"
              name="apiType"
              value="websocket"
              checked={apiType === "websocket"}
              onChange={() => setApiType("websocket")}
              disabled={isServerRunning}
              className="mr-1"
            />
            WebSocket
          </label>
          <label className="flex items-center text-sm">
            <input
              type="radio"
              name="apiType"
              value="siliconflow"
              checked={apiType === "siliconflow"}
              onChange={() => setApiType("siliconflow")}
              disabled={isServerRunning}
              className="mr-1"
            />
            硅基流动API
          </label>
        </div>
      </div>

      <div className="flex space-x-2 mb-3">
        <button
          className={`px-3 py-1 rounded text-sm ${
            isServerRunning
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          onClick={handleStartServer}
          disabled={isServerRunning}
        >
          Start Server
        </button>

        <button
          className={`px-3 py-1 rounded text-sm ${
            !isServerRunning
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
          onClick={handleStopServer}
          disabled={!isServerRunning}
        >
          Stop Server
        </button>
      </div>

      <div className="mb-2">
        <button
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "▼" : "►"} Advanced Settings
        </button>
      </div>

      {showAdvanced && (
        <div className="p-2 bg-gray-900 rounded">
          {apiType === "websocket" ? (
            <div className="mb-2">
              <label className="block text-xs mb-1">WebSocket Server URL</label>
              <input
                type="text"
                value={customServerUrl}
                onChange={(e) => setCustomServerUrl(e.target.value)}
                disabled={isServerRunning}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
              />
              <div className="text-xs text-gray-400 italic mt-1">
                Default: wss://mcp.anthropic.com/v1/socket
              </div>
            </div>
          ) : (
            <div className="mb-2">
              <div className="text-xs text-gray-400 italic">
                使用硅基流动API: https://api.siliconflow.cn/v1/chat/completions
              </div>
              <div className="text-xs text-gray-400 italic mt-1">
                API Key: sk-rpbdfcum******mdsnjiba
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-400">
        ModelWeb MCP v1.0 - Control your 3D editor with AI
      </div>
    </div>
  );
};

export default McpControlPanel;
