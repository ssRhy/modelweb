import {
  Scene,
  Object3D,
  Vector3,
  Euler,
  Color,
  Mesh,
  MeshStandardMaterial,
} from "three";
import {
  CommandHistory,
  AddObjectCommand,
  RemoveObjectCommand,
  MoveCommand,
  RotateCommand,
  ScaleCommand,
  SetMaterialValueCommand,
  SetVisibilityCommand,
} from "./CommandHistory";

// Singleton for holding current state
class McpState {
  private static instance: McpState;
  public currentScene: Scene | null = null;
  public commandHistory: CommandHistory | null = null;

  private constructor() {}

  public static getInstance(): McpState {
    if (!McpState.instance) {
      McpState.instance = new McpState();
    }
    return McpState.instance;
  }

  public setScene(scene: Scene) {
    this.currentScene = scene;
  }

  public setCommandHistory(history: CommandHistory) {
    this.commandHistory = history;
  }
}

// Helper to validate required parameters
function validateRequiredParams(
  params: any,
  requiredParams: string[]
): string | null {
  for (const param of requiredParams) {
    if (params[param] === undefined) {
      return `Missing required parameter: ${param}`;
    }
  }
  return null;
}

// Helper to find an object by name in the scene
function findObjectByName(scene: Scene, name: string): Object3D | null {
  if (!scene) return null;
  return scene.getObjectByName(name);
}

// MCP function implementations
export const mcpFunctions = {
  // Scene Management
  mcp_modelweb_get_scene_info: () => {
    const state = McpState.getInstance();
    const scene = state.currentScene;

    if (!scene) {
      return {
        status: "error",
        error: { code: "NO_SCENE", message: "No active scene found" },
      };
    }

    // Count different types of objects
    let meshCount = 0;
    let lightCount = 0;
    let cameraCount = 0;

    scene.traverse((object) => {
      if (object instanceof Mesh) meshCount++;
      if (object.type.includes("Light")) lightCount++;
      if (object.type.includes("Camera")) cameraCount++;
    });

    return {
      status: "success",
      result: {
        objectCount: scene.children.length,
        meshCount,
        lightCount,
        cameraCount,
        sceneStats: {
          uuid: scene.uuid,
          name: scene.name || "Untitled Scene",
          background: scene.background
            ? "#" + (scene.background as Color).getHexString()
            : "none",
        },
      },
    };
  },

  mcp_modelweb_get_object_info: (params: any) => {
    const state = McpState.getInstance();
    const scene = state.currentScene;

    const validationError = validateRequiredParams(params, ["objectName"]);
    if (validationError) {
      return {
        status: "error",
        error: { code: "INVALID_PARAMS", message: validationError },
      };
    }

    if (!scene) {
      return {
        status: "error",
        error: { code: "NO_SCENE", message: "No active scene found" },
      };
    }

    const object = findObjectByName(scene, params.objectName);
    if (!object) {
      return {
        status: "error",
        error: {
          code: "OBJECT_NOT_FOUND",
          message: `Object "${params.objectName}" not found`,
        },
      };
    }

    // Extract material information if available
    let materialInfo = null;
    if (object instanceof Mesh && object.material) {
      const material = object.material as MeshStandardMaterial;
      materialInfo = {
        type: material.type,
        color: material.color ? "#" + material.color.getHexString() : undefined,
        wireframe: material.wireframe,
        transparent: material.transparent,
        opacity: material.opacity,
        roughness:
          material.roughness !== undefined ? material.roughness : undefined,
        metalness:
          material.metalness !== undefined ? material.metalness : undefined,
      };
    }

    // Extract basic geometry information if available
    let geometryInfo = null;
    if (object instanceof Mesh && object.geometry) {
      geometryInfo = {
        type: object.geometry.type,
        vertices: object.geometry.attributes.position
          ? object.geometry.attributes.position.count
          : 0,
        // Add more geometry details as needed
      };
    }

    return {
      status: "success",
      result: {
        name: object.name,
        type: object.type,
        uuid: object.uuid,
        position: [object.position.x, object.position.y, object.position.z],
        rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
        scale: [object.scale.x, object.scale.y, object.scale.z],
        visible: object.visible,
        material: materialInfo,
        geometry: geometryInfo,
        children: object.children.length,
      },
    };
  },

  mcp_modelweb_list_objects: () => {
    const state = McpState.getInstance();
    const scene = state.currentScene;

    if (!scene) {
      return {
        status: "error",
        error: { code: "NO_SCENE", message: "No active scene found" },
      };
    }

    const objects: any[] = [];

    // Collect information about each object in the scene
    scene.traverse((object) => {
      if (object !== scene) {
        objects.push({
          name: object.name,
          type: object.type,
          uuid: object.uuid,
          visible: object.visible,
          position: [object.position.x, object.position.y, object.position.z],
          hasChildren: object.children.length > 0,
        });
      }
    });

    return {
      status: "success",
      result: {
        objects,
      },
    };
  },

  // Object Manipulation
  mcp_modelweb_create_object: (params: any) => {
    const state = McpState.getInstance();
    const scene = state.currentScene;
    const commandHistory = state.commandHistory;

    const validationError = validateRequiredParams(params, ["type"]);
    if (validationError) {
      return {
        status: "error",
        error: { code: "INVALID_PARAMS", message: validationError },
      };
    }

    if (!scene) {
      return {
        status: "error",
        error: { code: "NO_SCENE", message: "No active scene found" },
      };
    }

    // This would be expanded in a real implementation to create different object types
    // For now, just a stub that needs to be implemented with Three.js object creation logic
    const objectCreationLogic = () => {
      // This would be replaced with actual object creation logic
      const mockObject = new Object3D();
      mockObject.name = params.name || `New${params.type}`;

      if (params.position) {
        mockObject.position.set(
          params.position[0],
          params.position[1],
          params.position[2]
        );
      }

      if (params.rotation) {
        mockObject.rotation.set(
          params.rotation[0],
          params.rotation[1],
          params.rotation[2]
        );
      }

      if (params.scale) {
        mockObject.scale.set(params.scale[0], params.scale[1], params.scale[2]);
      }

      return mockObject;
    };

    try {
      const newObject = objectCreationLogic();

      // Add to scene using command pattern for undo support
      if (commandHistory) {
        const command = new AddObjectCommand(newObject, scene);
        commandHistory.execute(command);
      } else {
        scene.add(newObject);
      }

      return {
        status: "success",
        result: {
          objectId: newObject.uuid,
          name: newObject.name,
        },
      };
    } catch (error) {
      return {
        status: "error",
        error: {
          code: "CREATION_FAILED",
          message: `Failed to create object: ${(error as Error).message}`,
        },
      };
    }
  },

  mcp_modelweb_modify_object: (params: any) => {
    const state = McpState.getInstance();
    const scene = state.currentScene;
    const commandHistory = state.commandHistory;

    const validationError = validateRequiredParams(params, ["objectName"]);
    if (validationError) {
      return {
        status: "error",
        error: { code: "INVALID_PARAMS", message: validationError },
      };
    }

    if (!scene) {
      return {
        status: "error",
        error: { code: "NO_SCENE", message: "No active scene found" },
      };
    }

    const object = findObjectByName(scene, params.objectName);
    if (!object) {
      return {
        status: "error",
        error: {
          code: "OBJECT_NOT_FOUND",
          message: `Object "${params.objectName}" not found`,
        },
      };
    }

    try {
      // Apply transformations using command pattern for undo support
      if (params.position && commandHistory) {
        const newPosition = new Vector3(
          params.position[0],
          params.position[1],
          params.position[2]
        );
        const command = new MoveCommand(object, newPosition);
        commandHistory.execute(command);
      } else if (params.position) {
        object.position.set(
          params.position[0],
          params.position[1],
          params.position[2]
        );
      }

      if (params.rotation && commandHistory) {
        const newRotation = new Euler(
          params.rotation[0],
          params.rotation[1],
          params.rotation[2]
        );
        const command = new RotateCommand(object, newRotation);
        commandHistory.execute(command);
      } else if (params.rotation) {
        object.rotation.set(
          params.rotation[0],
          params.rotation[1],
          params.rotation[2]
        );
      }

      if (params.scale && commandHistory) {
        const newScale = new Vector3(
          params.scale[0],
          params.scale[1],
          params.scale[2]
        );
        const command = new ScaleCommand(object, newScale);
        commandHistory.execute(command);
      } else if (params.scale) {
        object.scale.set(params.scale[0], params.scale[1], params.scale[2]);
      }

      if (params.visible !== undefined && commandHistory) {
        const command = new SetVisibilityCommand(object, params.visible);
        commandHistory.execute(command);
      } else if (params.visible !== undefined) {
        object.visible = params.visible;
      }

      return {
        status: "success",
        result: {
          message: `Object "${params.objectName}" modified successfully`,
        },
      };
    } catch (error) {
      return {
        status: "error",
        error: {
          code: "MODIFICATION_FAILED",
          message: `Failed to modify object: ${(error as Error).message}`,
        },
      };
    }
  },

  mcp_modelweb_delete_object: (params: any) => {
    const state = McpState.getInstance();
    const scene = state.currentScene;
    const commandHistory = state.commandHistory;

    const validationError = validateRequiredParams(params, ["objectName"]);
    if (validationError) {
      return {
        status: "error",
        error: { code: "INVALID_PARAMS", message: validationError },
      };
    }

    if (!scene) {
      return {
        status: "error",
        error: { code: "NO_SCENE", message: "No active scene found" },
      };
    }

    const object = findObjectByName(scene, params.objectName);
    if (!object) {
      return {
        status: "error",
        error: {
          code: "OBJECT_NOT_FOUND",
          message: `Object "${params.objectName}" not found`,
        },
      };
    }

    try {
      // Remove object using command pattern for undo support
      if (commandHistory) {
        const command = new RemoveObjectCommand(object, scene);
        commandHistory.execute(command);
      } else {
        scene.remove(object);
      }

      return {
        status: "success",
        result: {
          message: `Object "${params.objectName}" deleted successfully`,
        },
      };
    } catch (error) {
      return {
        status: "error",
        error: {
          code: "DELETION_FAILED",
          message: `Failed to delete object: ${(error as Error).message}`,
        },
      };
    }
  },

  // History & Commands
  mcp_modelweb_undo: () => {
    const state = McpState.getInstance();
    const commandHistory = state.commandHistory;

    if (!commandHistory) {
      return {
        status: "error",
        error: { code: "NO_HISTORY", message: "Command history not available" },
      };
    }

    if (!commandHistory.canUndo()) {
      return {
        status: "error",
        error: { code: "CANNOT_UNDO", message: "Nothing to undo" },
      };
    }

    try {
      commandHistory.undo();
      return {
        status: "success",
        result: {
          message: "Undo operation successful",
        },
      };
    } catch (error) {
      return {
        status: "error",
        error: {
          code: "UNDO_FAILED",
          message: `Failed to undo: ${(error as Error).message}`,
        },
      };
    }
  },

  mcp_modelweb_redo: () => {
    const state = McpState.getInstance();
    const commandHistory = state.commandHistory;

    if (!commandHistory) {
      return {
        status: "error",
        error: { code: "NO_HISTORY", message: "Command history not available" },
      };
    }

    if (!commandHistory.canRedo()) {
      return {
        status: "error",
        error: { code: "CANNOT_REDO", message: "Nothing to redo" },
      };
    }

    try {
      commandHistory.redo();
      return {
        status: "success",
        result: {
          message: "Redo operation successful",
        },
      };
    } catch (error) {
      return {
        status: "error",
        error: {
          code: "REDO_FAILED",
          message: `Failed to redo: ${(error as Error).message}`,
        },
      };
    }
  },

  mcp_modelweb_get_history: () => {
    const state = McpState.getInstance();
    const commandHistory = state.commandHistory;

    if (!commandHistory) {
      return {
        status: "error",
        error: { code: "NO_HISTORY", message: "Command history not available" },
      };
    }

    return {
      status: "success",
      result: {
        canUndo: commandHistory.canUndo(),
        canRedo: commandHistory.canRedo(),
        undoStackSize: commandHistory.getUndoStackSize(),
        redoStackSize: commandHistory.getRedoStackSize(),
      },
    };
  },
};

// Central handler for MCP function calls
export function handleMcpRequest(request: any) {
  const { function: functionName, parameters, requestId } = request;

  // Check if the requested function exists
  if (!mcpFunctions[functionName as keyof typeof mcpFunctions]) {
    return {
      requestId,
      status: "error",
      error: {
        code: "UNKNOWN_FUNCTION",
        message: `Function "${functionName}" is not supported`,
      },
    };
  }

  try {
    // Call the function with the provided parameters
    const result = (
      mcpFunctions[functionName as keyof typeof mcpFunctions] as Function
    )(parameters || {});

    // Add the requestId to the response
    return {
      requestId,
      ...result,
    };
  } catch (error) {
    return {
      requestId,
      status: "error",
      error: {
        code: "EXECUTION_ERROR",
        message: `Error executing function: ${(error as Error).message}`,
      },
    };
  }
}

// Function to initialize the MCP server with the current scene and command history
export function initializeMcpServer(
  scene: Scene,
  commandHistory: CommandHistory
) {
  const state = McpState.getInstance();
  state.setScene(scene);
  state.setCommandHistory(commandHistory);

  console.log("MCP Server initialized with scene and command history");

  return {
    handleRequest: handleMcpRequest,
  };
}
