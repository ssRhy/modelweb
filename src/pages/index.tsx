import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, TransformControls } from "@react-three/drei";
import {
  Object3D,
  Scene,
  Mesh,
  DirectionalLight,
  AmbientLight,
  PointLight,
} from "three";
import SceneHierarchy from "../components/SceneHierarchy";
import PropertiesPanel from "../components/PropertiesPanel";
import Toolbar from "../components/Toolbar";
import { useThree } from "@react-three/fiber";
import SceneContent from "../components/SceneContent";

const Home: React.FC = () => {
  const [selectedObject, setSelectedObject] = useState<Object3D | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [transformMode, setTransformMode] = useState<
    "translate" | "rotate" | "scale"
  >("translate");

  const handleSceneReady = (newScene: Scene) => {
    setScene(newScene);
  };

  const handleAddObject = (
    object: Mesh | DirectionalLight | AmbientLight | PointLight
  ) => {
    if (scene) {
      scene.add(object);
      setSelectedObject(object);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* 顶部工具栏 */}
      <Toolbar onAddObject={handleAddObject} />

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧面板 - 场景层级 */}
        <div className="w-64 border-r border-gray-700 flex flex-col overflow-hidden">
          {scene && (
            <SceneHierarchy
              scene={scene}
              selectedObject={selectedObject}
              onSelect={setSelectedObject}
            />
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
              onSelect={setSelectedObject}
              onSceneReady={handleSceneReady}
              transformMode={transformMode}
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
          <PropertiesPanel selectedObject={selectedObject} />
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-center py-2 text-xs border-t border-gray-700">
        3D 模型编辑器 - 基于 Three.js 开发
      </footer>
    </div>
  );
};

export default Home;
