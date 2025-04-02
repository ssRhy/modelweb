import React from "react";
import { Object3D, Scene } from "three";

interface SceneHierarchyProps {
  scene: Scene;
  selectedObject: Object3D | null;
  onSelect: (object: Object3D | null) => void;
  onDelete?: (object: Object3D) => void;
}

interface SceneNodeProps {
  object: Object3D;
  depth: number;
  selectedObject: Object3D | null;
  onSelect: (object: Object3D | null) => void;
  onDelete?: (object: Object3D) => void;
}

const SceneNode: React.FC<SceneNodeProps> = ({
  object,
  depth,
  selectedObject,
  onSelect,
  onDelete,
}) => {
  const isSelected = selectedObject === object;
  const hasChildren = object.children.length > 0;

  // 处理删除对象
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发选择事件
    if (onDelete) {
      onDelete(object);
    }
  };

  return (
    <div style={{ marginLeft: `${depth * 16}px` }}>
      <div
        className={`flex items-center justify-between py-1 px-2 cursor-pointer hover:bg-gray-700 group ${
          isSelected ? "bg-blue-600" : ""
        }`}
        onClick={() => onSelect(object)}
      >
        <div className="flex items-center">
          {hasChildren && (
            <span className="mr-1">{object.visible ? "▼" : "▶"}</span>
          )}
          <span>{object.name || object.type}</span>
        </div>

        {/* 操作按钮 */}
        {object.type !== "Scene" && (
          <div className="flex space-x-1">
            <button
              className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
              onClick={handleDelete}
              title="删除对象"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              </svg>
            </button>
          </div>
        )}
      </div>

      {object.visible &&
        object.children.map((child, index) => (
          <SceneNode
            key={`${child.uuid}-${index}`}
            object={child}
            depth={depth + 1}
            selectedObject={selectedObject}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
};

const SceneHierarchy: React.FC<SceneHierarchyProps> = ({
  scene,
  selectedObject,
  onSelect,
  onDelete,
}) => {
  return (
    <div className="bg-gray-800 text-white overflow-auto h-1/2">
      <div className="p-2">
        <h2 className="text-lg font-semibold mb-2">场景层级</h2>
        <div className="space-y-1">
          {scene.children.map((object, index) => (
            <SceneNode
              key={`${object.uuid}-${index}`}
              object={object}
              depth={0}
              selectedObject={selectedObject}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SceneHierarchy;
