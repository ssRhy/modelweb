import React from "react";

interface ControlPanelProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  onModelUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onExport: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isEditing,
  setIsEditing,
  onModelUpload,
  onReset,
  onExport,
}) => {
  return (
    <div className="bg-gray-800 text-white p-4 flex flex-col space-y-4">
      <h2 className="text-xl font-bold">3D Model Editor</h2>

      <div className="space-y-2">
        <p className="text-sm">Upload a 3D model (GLTF/GLB format)</p>
        <input
          type="file"
          accept=".gltf,.glb"
          onChange={onModelUpload}
          className="block w-full text-sm text-gray-300
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-600 file:text-white
                    hover:file:bg-blue-700"
        />
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-md ${
            isEditing ? "bg-green-600" : "bg-blue-600"
          }`}
        >
          {isEditing ? "Exit Edit Mode" : "Edit Model"}
        </button>

        <button
          onClick={onReset}
          className="px-4 py-2 rounded-md bg-yellow-600 hover:bg-yellow-700"
        >
          Reset
        </button>

        <button
          onClick={onExport}
          className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700"
        >
          Export
        </button>
      </div>

      {isEditing && (
        <div className="p-3 bg-gray-700 rounded-md">
          <h3 className="font-medium mb-2">Edit Controls</h3>
          <ul className="text-sm space-y-1">
            <li>• Click and drag to move the model</li>
            <li>• Use arrow keys for precise movement</li>
            <li>• Press 'R' to rotate, 'S' to scale</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
