import React, { useRef } from "react";
import {
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  Mesh,
  DirectionalLight,
  AmbientLight,
  PointLight,
} from "three";

interface ToolbarProps {
  onAddObject: (
    object: Mesh | DirectionalLight | AmbientLight | PointLight
  ) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddObject }) => {
  const objectCountRef = useRef(0);

  const getNextId = () => {
    objectCountRef.current += 1;
    return objectCountRef.current;
  };

  const addCube = () => {
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshStandardMaterial({ color: 0x636363 });
    const cube = new Mesh(geometry, material);
    cube.name = `Cube_${getNextId()}`;
    onAddObject(cube);
  };

  const addSphere = () => {
    const geometry = new SphereGeometry(0.5, 32, 32);
    const material = new MeshStandardMaterial({ color: 0x636363 });
    const sphere = new Mesh(geometry, material);
    sphere.name = `Sphere_${getNextId()}`;
    onAddObject(sphere);
  };

  const addCylinder = () => {
    const geometry = new CylinderGeometry(0.5, 0.5, 1, 32);
    const material = new MeshStandardMaterial({ color: 0x636363 });
    const cylinder = new Mesh(geometry, material);
    cylinder.name = `Cylinder_${getNextId()}`;
    onAddObject(cylinder);
  };

  const addDirectionalLight = () => {
    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    light.name = `DirectionalLight_${getNextId()}`;
    onAddObject(light);
  };

  const addPointLight = () => {
    const light = new PointLight(0xffffff, 1);
    light.position.set(0, 2, 0);
    light.name = `PointLight_${getNextId()}`;
    onAddObject(light);
  };

  const addAmbientLight = () => {
    const light = new AmbientLight(0x404040);
    light.name = `AmbientLight_${getNextId()}`;
    onAddObject(light);
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center space-x-2">
      <div className="flex items-center space-x-1 border-r border-gray-700 pr-2">
        <button
          onClick={addCube}
          className="p-2 hover:bg-gray-700 rounded-lg tooltip"
          title="Add Cube"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5Z" />
          </svg>
        </button>

        <button
          onClick={addSphere}
          className="p-2 hover:bg-gray-700 rounded-lg tooltip"
          title="Add Sphere"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
        </button>

        <button
          onClick={addCylinder}
          className="p-2 hover:bg-gray-700 rounded-lg tooltip"
          title="Add Cylinder"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
          </svg>
        </button>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={addDirectionalLight}
          className="p-2 hover:bg-gray-700 rounded-lg tooltip"
          title="Add Directional Light"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,12H7A5,5 0 0,1 12,7A5,5 0 0,1 17,12H21A1,1 0 0,1 22,13A1,1 0 0,1 21,14H3A1,1 0 0,1 2,13A1,1 0 0,1 3,12M5,15H19A1,1 0 0,1 20,16A1,1 0 0,1 19,17H5A1,1 0 0,1 4,16A1,1 0 0,1 5,15M7,19H17A1,1 0 0,1 18,20A1,1 0 0,1 17,21H7A1,1 0 0,1 6,20A1,1 0 0,1 7,19Z" />
          </svg>
        </button>

        <button
          onClick={addPointLight}
          className="p-2 hover:bg-gray-700 rounded-lg tooltip"
          title="Add Point Light"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z" />
          </svg>
        </button>

        <button
          onClick={addAmbientLight}
          className="p-2 hover:bg-gray-700 rounded-lg tooltip"
          title="Add Ambient Light"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
