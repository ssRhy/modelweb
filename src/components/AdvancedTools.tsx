import React, { useRef, useState } from "react";
import { Scene, Object3D, MeshStandardMaterial } from "three";
import { SceneIO, FileType } from "../lib/SceneIO";
import { CommandHistory } from "../lib/CommandHistory";
import { TextureManager } from "../lib/TextureManager";
import TextureEditor from "./TextureEditor";
import AdvancedGeometries from "./AdvancedGeometries";

interface AdvancedToolsProps {
  scene: Scene | null;
  commandHistory: CommandHistory;
  onAddObject: (object: Object3D) => void;
  selectedObject: Object3D | null;
}

const AdvancedTools: React.FC<AdvancedToolsProps> = ({
  scene,
  commandHistory,
  onAddObject,
  selectedObject,
}) => {
  const [isGeometriesOpen, setIsGeometriesOpen] = useState(false);
  const [isTextureEditorOpen, setIsTextureEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理导入模型
  const handleImportModel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !scene) return;

    try {
      const file = files[0];
      const importedObject = await SceneIO.importModel(file);

      // 添加导入的对象到场景
      if (importedObject) {
        onAddObject(importedObject);
      }

      // 重置文件输入，以便可以再次选择相同的文件
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("导入模型出错:", error);
      alert(`导入模型失败: ${error.message || "未知错误"}`);
    }
  };

  // 处理导出模型
  const handleExportModel = async (fileType: FileType) => {
    if (!scene) return;

    try {
      const blob = await SceneIO.exportModel(scene, fileType);

      // 构建文件名
      const timestamp = new Date()
        .toISOString()
        .replace(/:/g, "-")
        .slice(0, 19);
      const extension = fileType.toLowerCase();
      const fileName = `model_${timestamp}.${extension}`;

      // 下载文件
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("导出模型出错:", error);
      alert(`导出模型失败: ${error.message || "未知错误"}`);
    }
  };

  // 保存场景到JSON
  const handleSaveScene = () => {
    if (!scene) return;

    try {
      const serializedScene = SceneIO.serializeScene(scene);
      const blob = new Blob([serializedScene], { type: "application/json" });

      // 构建文件名
      const timestamp = new Date()
        .toISOString()
        .replace(/:/g, "-")
        .slice(0, 19);
      const fileName = `scene_${timestamp}.json`;

      // 下载文件
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("保存场景出错:", error);
      alert(`保存场景失败: ${error.message || "未知错误"}`);
    }
  };

  // 打开材质纹理编辑器
  const handleOpenTextureEditor = () => {
    if (
      selectedObject &&
      "material" in selectedObject &&
      selectedObject.material instanceof MeshStandardMaterial
    ) {
      setIsTextureEditorOpen(true);
    } else {
      alert("请先选择一个带有标准材质的对象");
    }
  };

  // 打开高级几何体工具
  const handleOpenGeometries = () => {
    setIsGeometriesOpen(true);
  };

  return (
    <div className="p-4 border-t border-gray-700">
      <h3 className="text-sm font-bold mb-3">高级工具</h3>

      {/* 导入/导出按钮 */}
      <div className="mb-4">
        <div className="text-xs font-medium mb-2">模型导入/导出</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs"
          >
            导入模型
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".gltf,.glb,.obj,.fbx,.stl"
            onChange={handleImportModel}
            className="hidden"
          />

          <div className="relative group">
            <button className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs">
              导出模型
            </button>
            <div className="absolute hidden group-hover:block left-0 mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExportModel(FileType.GLB)}
                  className="block w-full text-left px-4 py-1 text-xs hover:bg-gray-700"
                >
                  导出为GLB
                </button>
                <button
                  onClick={() => handleExportModel(FileType.GLTF)}
                  className="block w-full text-left px-4 py-1 text-xs hover:bg-gray-700"
                >
                  导出为GLTF
                </button>
                <button
                  onClick={() => handleExportModel(FileType.OBJ)}
                  className="block w-full text-left px-4 py-1 text-xs hover:bg-gray-700"
                >
                  导出为OBJ
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveScene}
            className="px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs"
          >
            保存场景
          </button>
        </div>
      </div>

      {/* 撤销/重做按钮 */}
      <div className="mb-4">
        <div className="text-xs font-medium mb-2">历史记录</div>
        <div className="flex space-x-2">
          <button
            onClick={() => commandHistory.undo()}
            disabled={!commandHistory.canUndo()}
            className={`px-2 py-1 rounded text-xs ${
              commandHistory.canUndo()
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-800 text-gray-600 cursor-not-allowed"
            }`}
          >
            撤销
          </button>
          <button
            onClick={() => commandHistory.redo()}
            disabled={!commandHistory.canRedo()}
            className={`px-2 py-1 rounded text-xs ${
              commandHistory.canRedo()
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-800 text-gray-600 cursor-not-allowed"
            }`}
          >
            重做
          </button>
        </div>
      </div>

      {/* 高级编辑工具 */}
      <div className="mb-4">
        <div className="text-xs font-medium mb-2">高级编辑</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleOpenGeometries}
            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-xs"
          >
            高级几何体
          </button>
          <button
            onClick={handleOpenTextureEditor}
            disabled={
              !(
                selectedObject &&
                "material" in selectedObject &&
                selectedObject.material instanceof MeshStandardMaterial
              )
            }
            className={`px-2 py-1 rounded text-xs ${
              selectedObject &&
              "material" in selectedObject &&
              selectedObject.material instanceof MeshStandardMaterial
                ? "bg-amber-600 hover:bg-amber-500"
                : "bg-gray-800 text-gray-600 cursor-not-allowed"
            }`}
          >
            纹理编辑器
          </button>
        </div>
      </div>

      {/* 高级几何体弹窗 */}
      {isGeometriesOpen && (
        <AdvancedGeometries
          onAddObject={onAddObject}
          onClose={() => setIsGeometriesOpen(false)}
        />
      )}

      {/* 纹理编辑器弹窗 */}
      {isTextureEditorOpen &&
        selectedObject &&
        "material" in selectedObject &&
        selectedObject.material instanceof MeshStandardMaterial && (
          <TextureEditor
            material={selectedObject.material}
            onClose={() => setIsTextureEditorOpen(false)}
          />
        )}
    </div>
  );
};

export default AdvancedTools;
