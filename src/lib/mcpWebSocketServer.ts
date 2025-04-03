import { Scene } from "three";
import { CommandHistory } from "./CommandHistory";
import { handleMcpRequest, initializeMcpServer } from "./mcpServer";

// WebSocket server for MCP communications
export class McpWebSocketServer {
  private static instance: McpWebSocketServer;
  private webSocket: WebSocket | null = null;
  private mcpServerHandler: any = null;
  private connectedClients: Set<WebSocket> = new Set();
  private isServerRunning: boolean = false;
  private wsServerUrl: string = "";
  // Added flag for Silicon Flow API integration
  public useSiliconFlowApi: boolean = false;

  private constructor() {}

  /**
   * Get the singleton instance of McpWebSocketServer
   */
  public static getInstance(): McpWebSocketServer {
    if (!McpWebSocketServer.instance) {
      McpWebSocketServer.instance = new McpWebSocketServer();
    }
    return McpWebSocketServer.instance;
  }

  /**
   * Initialize the MCP WebSocket server
   * @param scene The Three.js scene to be controlled via MCP
   * @param commandHistory The command history for undo/redo operations
   * @param port The port to run the WebSocket server on
   * @returns A promise that resolves when the server is started
   */
  public initialize(scene: Scene, commandHistory: CommandHistory): void {
    // Initialize the MCP server with the scene and command history
    this.mcpServerHandler = initializeMcpServer(scene, commandHistory);

    // For client-side, we don't actually create a WebSocket server
    // Instead, we create a mock server object that handles communication with the AI
    console.log("MCP WebSocket client initialized and ready for connections");
  }

  /**
   * Start the MCP WebSocket client for communication with AI assistants
   * @returns A promise that resolves when the client is connected
   */
  public startClient(
    url: string = "wss://mcp.anthropic.com/v1/socket"
  ): Promise<void> {
    if (this.isServerRunning) {
      console.warn("MCP WebSocket client is already running");
      return Promise.resolve();
    }

    this.wsServerUrl = url;

    // If using Silicon Flow API, don't create WebSocket connection
    if (
      this.useSiliconFlowApi ||
      url.startsWith("https://api.siliconflow.cn")
    ) {
      this.useSiliconFlowApi = true;
      console.log("Using Silicon Flow API instead of WebSocket");
      this.isServerRunning = true;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Create a new WebSocket connection
        this.webSocket = new WebSocket(url);

        // Handle connection open
        this.webSocket.onopen = () => {
          console.log("MCP WebSocket client connected");
          this.isServerRunning = true;
          resolve();
        };

        // Handle incoming messages
        this.webSocket.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };

        // Handle errors
        this.webSocket.onerror = (error) => {
          console.error("MCP WebSocket client error:", error);
          reject(error);
        };

        // Handle connection close
        this.webSocket.onclose = () => {
          console.log("MCP WebSocket client disconnected");
          this.isServerRunning = false;
        };
      } catch (error) {
        console.error("Failed to start MCP WebSocket client:", error);
        reject(error);
      }
    });
  }

  /**
   * Stop the MCP WebSocket client
   */
  public stopClient(): void {
    if (!this.isServerRunning) {
      console.warn("MCP WebSocket client is not running");
      return;
    }

    // Close the WebSocket connection if it exists
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }

    this.isServerRunning = false;
    this.useSiliconFlowApi = false;
    console.log("MCP WebSocket client stopped");
  }

  /**
   * Handle incoming WebSocket messages
   * @param data The message data
   */
  public handleIncomingMessage(data: any): void {
    try {
      // Parse the JSON message
      const message = typeof data === "string" ? JSON.parse(data) : data;

      // Process the MCP request and get a response
      const response = this.mcpServerHandler.handleRequest(message);

      // Send the response back
      this.sendResponse(response);
    } catch (error) {
      console.error("Error handling MCP WebSocket message:", error);

      // Send an error response back
      if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        const errorResponse = {
          requestId:
            typeof data === "object" && data.requestId
              ? data.requestId
              : "unknown",
          status: "error",
          error: {
            code: "INVALID_REQUEST",
            message: `Error processing request: ${(error as Error).message}`,
          },
        };

        this.webSocket.send(JSON.stringify(errorResponse));
      }
    }
  }

  /**
   * Send a response back to the client
   * @param response The response to send
   */
  public sendResponse(response: any): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(response));
    }
  }

  /**
   * Check if the MCP WebSocket client is running
   * @returns True if the client is running, false otherwise
   */
  public isRunning(): boolean {
    return this.isServerRunning;
  }

  /**
   * Get the WebSocket server URL
   * @returns The WebSocket server URL
   */
  public getServerUrl(): string {
    return this.wsServerUrl;
  }

  /**
   * Send an MCP request directly (for testing or local processing)
   * @param request The MCP request to process
   * @returns The response from the MCP server
   */
  public sendMcpRequest(request: any): any {
    if (!this.mcpServerHandler) {
      throw new Error("MCP server not initialized");
    }

    return this.mcpServerHandler.handleRequest(request);
  }
}

// Create and export a default instance
export default McpWebSocketServer.getInstance();
