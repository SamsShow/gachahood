"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import Machine from "./Machine";
import Claw from "./Claw";
import Prizes from "./Prizes";
import Room from "./Room";
import { WALL } from "../lib/palette";

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.2, 12.6], fov: 38 }}
      gl={{ toneMappingExposure: 0.85 }}
    >
      <color attach="background" args={[WALL]} />
      <fog attach="fog" args={[WALL, 26, 68]} />

      <Room />

      <hemisphereLight args={["#FFF6E8", "#C9BFA8", 0.42]} />
      <ambientLight intensity={0.2} />
      <directionalLight
        castShadow
        position={[3, 13, 9]}
        intensity={1.6}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
        shadow-camera-near={1}
        shadow-camera-far={32}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[-7, 5, -6]} intensity={0.3} color="#DCE8FF" />

      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[0, 7, 4]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[12, 8, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.6}
          position={[-7, 3, 3]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[8, 6, 1]}
          color="#FFF3E4"
        />
        <Lightformer
          form="rect"
          intensity={0.5}
          position={[7, 3, 3]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[8, 6, 1]}
          color="#E8F1FF"
        />
      </Environment>

      {/* cabinet interior light — without it the back panel reads as a grey slab */}
      <pointLight position={[0, 1.85, 0]} intensity={7} distance={5.5} decay={2} color="#FFF7EC" />
      <pointLight position={[0, 1.1, 1.2]} intensity={5} distance={4} decay={2} color="#FFFFFF" />

      <Suspense fallback={null}>
        <Physics>
          <Machine />
          <Prizes />
          <Claw />
        </Physics>
      </Suspense>

      <ContactShadows
        position={[0, -2.44, 0]}
        scale={16}
        blur={2.4}
        far={5}
        opacity={0.5}
        color="#4A4438"
        resolution={512}
      />

      <OrbitControls
        target={[0, 0.45, 0]}
        enablePan={false}
        minDistance={9}
        maxDistance={14}
        minPolarAngle={0.7}
        maxPolarAngle={1.48}
        minAzimuthAngle={-0.7}
        maxAzimuthAngle={0.7}
      />
    </Canvas>
  );
}
