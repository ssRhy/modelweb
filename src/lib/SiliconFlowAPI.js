/**
 * Silicon Flow API Integration for MCP
 *
 * This file provides integration with the Silicon Flow API for ModelWeb MCP.
 */

// Silicon Flow API configuration
const SILICONFLOW_API_URL = "https://api.siliconflow.cn/v1/chat/completions";
const SILICONFLOW_API_KEY =
  "sk-rpbdfcumdlwdfssveutdyweficaabukciujbkoltmdsnjiba";

/**
 * Send a request to the Silicon Flow API
 * @param {object} mcpRequest - The MCP request to process
 * @param {array} messageHistory - Previous conversation history
 * @returns {Promise<object>} - The API response
 */
export async function sendToSiliconFlowAPI(mcpRequest, messageHistory = []) {
  try {
    // Create a message that describes the MCP request
    const requestContent = [
      {
        type: "text",
        text: `Execute the following MCP command in the 3D editor:\n\`\`\`json\n${JSON.stringify(
          mcpRequest,
          null,
          2
        )}\n\`\`\``,
      },
    ];

    // Prepare the API request
    const apiRequest = {
      model: "Qwen/QwQ-32B",
      messages: [
        ...messageHistory,
        {
          role: "user",
          content: requestContent,
        },
      ],
      stream: false,
      max_tokens: 512,
      stop: null,
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      frequency_penalty: 0.5,
      n: 1,
      response_format: {
        type: "text",
      },
      tools: [
        {
          type: "function",
          function: {
            description: "Execute MCP command in 3D editor",
            name: "execute_mcp_command",
            parameters: {},
            strict: false,
          },
        },
      ],
    };

    // Send the request to the API
    const response = await fetch(SILICONFLOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SILICONFLOW_API_KEY}`,
      },
      body: JSON.stringify(apiRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Silicon Flow API error: ${response.status} - ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling Silicon Flow API:", error);
    throw error;
  }
}

/**
 * Update the MCP WebSocket server to use Silicon Flow API
 * @param {object} mcpWebSocketServer - The MCP WebSocket server instance
 */
export function patchMcpWebSocketServer(mcpWebSocketServer) {
  // Store the original handleIncomingMessage method
  const originalHandleIncomingMessage =
    mcpWebSocketServer.handleIncomingMessage;

  // Create a message history store
  const messageHistory = [];

  // Override the handleIncomingMessage method to include Silicon Flow API
  mcpWebSocketServer.handleIncomingMessage = async function (data) {
    try {
      // Parse the JSON message
      const message = typeof data === "string" ? JSON.parse(data) : data;

      // Process the MCP request with the local server first
      const localResponse = this.mcpServerHandler.handleRequest(message);

      try {
        // Also send to Silicon Flow API
        const apiResponse = await sendToSiliconFlowAPI(message, messageHistory);

        // Update message history
        if (apiResponse.choices && apiResponse.choices.length > 0) {
          // Add user message
          messageHistory.push({
            role: "user",
            content: `Execute MCP command: ${JSON.stringify(message)}`,
          });

          // Add assistant response
          messageHistory.push({
            role: "assistant",
            content: apiResponse.choices[0].message.content,
          });

          // Keep history manageable (last 10 messages)
          while (messageHistory.length > 10) {
            messageHistory.shift();
          }
        }

        // Combine local response with API insights
        const combinedResponse = {
          ...localResponse,
          aiInsights:
            apiResponse.choices && apiResponse.choices.length > 0
              ? apiResponse.choices[0].message.content
              : "No AI insights available",
        };

        // Send the combined response
        this.sendResponse(combinedResponse);
      } catch (apiError) {
        console.error(
          "Error with Silicon Flow API, falling back to local response:",
          apiError
        );
        // Fall back to local response only
        this.sendResponse(localResponse);
      }
    } catch (error) {
      console.error("Error handling MCP message:", error);

      // Send an error response
      const errorResponse = {
        requestId:
          typeof data === "object" && data.requestId
            ? data.requestId
            : "unknown",
        status: "error",
        error: {
          code: "INVALID_REQUEST",
          message: `Error processing request: ${error.message}`,
        },
      };

      this.sendResponse(errorResponse);
    }
  };

  console.log("MCP WebSocket server patched to use Silicon Flow API");
}

/**
 * Initialize Silicon Flow API integration
 */
export function initializeSiliconFlowAPI() {
  console.log("Silicon Flow API integration initialized");
  return {
    sendToSiliconFlowAPI,
    patchMcpWebSocketServer,
  };
}
