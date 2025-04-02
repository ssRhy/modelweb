import React from "react";
import { Object3D, Scene } from "three";

interface SceneHierarchyProps {
  scene: Scene;
  selectedObject: Object3D | null;
  onSelect: (object: Object3D | null) => void;
}

interface SceneNodeProps {
  object: Object3D;
  depth: number;
  selectedObject: Object3D | null;
  onSelect: (object: Object3D | null) => void;
}

const SceneNode: React.FC<SceneNodeProps> = ({
  object,
  depth,
  selectedObject,
  onSelect,
}) => {
  const isSelected = selectedObject === object;
  const hasChildren = object.children.length > 0;

  return (
    <div style={{ marginLeft: `${depth * 16}px` }}>
      <div
        className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-700 ${
          isSelected ? "bg-blue-600" : ""
        }`}
        onClick={() => onSelect(object)}
      >
        {hasChildren && (
          <span className="mr-1">{object.visible ? "▼" : "▶"}</span>
        )}
        <span>{object.name || object.type}</span>
      </div>
      {object.visible &&
        object.children.map((child, index) => (
          <SceneNode
            key={`${child.uuid}-${index}`}
            object={child}
            depth={depth + 1}
            selectedObject={selectedObject}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
};

const SceneHierarchy: React.FC<SceneHierarchyProps> = ({
  scene,
  selectedObject,
  onSelect,
}) => {
  return (
    <div className="bg-gray-800 text-white overflow-auto h-full">
      <div className="p-2">
        <h2 className="text-lg font-semibold mb-2">Scene Hierarchy</h2>
        <div className="space-y-1">
          {scene.children.map((object, index) => (
            <SceneNode
              key={`${object.uuid}-${index}`}
              object={object}
              depth={0}
              selectedObject={selectedObject}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SceneHierarchy;
