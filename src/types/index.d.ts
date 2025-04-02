/// <reference types="react" />
/// <reference types="three" />

import * as THREE from "three";

// Adding missing library declarations
declare module "draco3d" {}
declare module "json5" {}
declare module "stats.js" {}
declare module "offscreencanvas" {}
declare module "prop-types" {}
declare module "react-reconciler" {}
declare module "webxr" {}

// Define JSX.IntrinsicElements for Three.js components
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Basic Three.js elements
      group: any;
      primitive: any;
      mesh: any;
      scene: any;

      // Materials
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      meshPhongMaterial: any;

      // Geometries
      boxGeometry: any;
      sphereGeometry: any;

      // Lights
      ambientLight: any;
      pointLight: any;
      directionalLight: any;

      // Camera
      perspectiveCamera: any;
      orthographicCamera: any;

      // Grid
      gridHelper: any;
    }
  }

  namespace THREE {
    interface Group extends THREE.Object3D {}
  }
}
