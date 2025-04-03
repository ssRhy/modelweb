import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, TransformControls } from "@react-three/drei";
import {
  Object3D,
  Scene,
  Mesh,
  DirectionalLight,
  AmbientLight,
  PointLight,
  Vector3,
  Euler,
  BufferGeometry,
  Material,
} from "three";
import SceneHierarchy from "../components/SceneHierarchy";
import PropertiesPanel from "../components/PropertiesPanel";
import Toolbar from "../components/Toolbar";
import SceneContent from "../components/SceneContent";
import AdvancedTools from "../components/AdvancedTools";
import McpControlPanel from "../components/McpControlPanel";
import {
  CommandHistory,
  MoveCommand,
  RotateCommand,
  ScaleCommand,
  AddObjectCommand,
  RemoveObjectCommand,
} from "../lib/CommandHistory";

const Home: React.FC = () => {
  const [selectedObject, setSelectedObject] = useState<Object3D | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [transformMode, setTransformMode] = useState<
    "translate" | "rotate" | "scale"
  >("translate");
  const commandHistoryRef = useRef<CommandHistory>(new CommandHistory(50)); // 保存最多50条历史记录
  const [, forceUpdate] = useState<{}>({});

  // 当操作历史变化时强制更新界面
  useEffect(() => {
    const commandHistory = commandHistoryRef.current;
    commandHistory.setOnHistoryChange(() => {
      forceUpdate({});
    });
  }, []);

  const handleSceneReady = (newScene: Scene) => {
    setScene(newScene);
  };

  const handleAddObject = (object: Object3D) => {
    if (scene) {
      // 使用命令模式添加对象
      const command = new AddObjectCommand(object, scene);
      commandHistoryRef.current.execute(command);
      setSelectedObject(object);
    }
  };

  const handleRemoveObject = (object: Object3D) => {
    if (scene && object !== scene) {
      // 使用命令模式删除对象
      const command = new RemoveObjectCommand(object, scene);
      commandHistoryRef.current.execute(command);
      setSelectedObject(null);
    }
  };

  // 处理对象变换完成时记录命令
  const handleTransformEnd = (
    object: Object3D,
    type: "position" | "rotation" | "scale",
    newValue: Vector3 | Euler
  ) => {
    let command;

    switch (type) {
      case "position":
        command = new MoveCommand(object, newValue as Vector3);
        break;
      case "rotation":
        command = new RotateCommand(object, newValue as Euler);
        break;
      case "scale":
        command = new ScaleCommand(object, newValue as Vector3);
        break;
    }

    if (command) {
      commandHistoryRef.current.execute(command);
    }
  };

  const handleObjectSelect = (object: Object3D | null) => {
    setSelectedObject(object);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* 顶部工具栏 */}
      <Toolbar onAddObject={handleAddObject} />

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧面板 - 场景层级 */}
        <div className="w-64 border-r border-gray-700 flex flex-col overflow-hidden">
          {scene && (
            <>
              <SceneHierarchy
                scene={scene}
                selectedObject={selectedObject}
                onSelect={handleObjectSelect}
                onDelete={handleRemoveObject}
              />

              {/* 高级工具组件 */}
              <AdvancedTools
                scene={scene}
                commandHistory={commandHistoryRef.current}
                onAddObject={handleAddObject}
                selectedObject={selectedObject}
              />

              {/* MCP控制面板 */}
              <div className="mt-4 px-2">
                <McpControlPanel
                  scene={scene}
                  commandHistory={commandHistoryRef.current}
                />
              </div>
            </>
          )}
        </div>

        {/* 主要3D视图 */}
        <div className="flex-1 relative">
          <Canvas
            shadows
            camera={{ position: [5, 5, 5], fov: 50 }}
            className="w-full h-full"
          >
            <SceneContent
              selectedObject={selectedObject}
              onSelect={handleObjectSelect}
              onSceneReady={handleSceneReady}
              transformMode={transformMode}
              onTransformEnd={handleTransformEnd}
            />
          </Canvas>

          {/* 变换模式按钮 */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <button
              onClick={() => setTransformMode("translate")}
              className={`px-4 py-2 rounded-lg ${
                transformMode === "translate"
                  ? "bg-blue-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              移动
            </button>
            <button
              onClick={() => setTransformMode("rotate")}
              className={`px-4 py-2 rounded-lg ${
                transformMode === "rotate"
                  ? "bg-blue-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              旋转
            </button>
            <button
              onClick={() => setTransformMode("scale")}
              className={`px-4 py-2 rounded-lg ${
                transformMode === "scale"
                  ? "bg-blue-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              缩放
            </button>
          </div>
        </div>

        {/* 右侧面板 - 属性 */}
        <div className="w-64 border-l border-gray-700">
          <PropertiesPanel
            selectedObject={selectedObject}
            commandHistory={commandHistoryRef.current}
          />
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-center py-2 text-xs border-t border-gray-700 flex justify-between items-center px-4">
        <div>3D 模型编辑器 - 基于 Three.js 开发</div>
        <div className="text-blue-400">MCP 协议已集成</div>
      </footer>
    </div>
  );
};

export default Home;
