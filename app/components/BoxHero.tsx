"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import GiftBox from "./GiftBox";
import { WALL } from "../lib/palette";

// [x, y, z, scale, itemId, floatSpeed]
const BOXES: [number, number, number, number, string, number][] = [
  [0, 0.15, 0, 2.9, "bomber", 1.1],
  [-2.6, -0.35, -1.2, 1.95, "whitecap", 1.5],
  [2.5, 0.5, -1.4, 1.5, "blackcap", 1.3],
  [-4.0, 0.75, -2.6, 1.35, "neonhoodie", 1.8],
  [3.9, -0.5, -2.2, 1.8, "sipper", 1.6],
];

export default function BoxHero() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 7.5], fov: 36 }}
      gl={{ toneMappingExposure: 0.95 }}
      style={{ pointerEvents: "none" }}
    >
      <color attach="background" args={[WALL]} />
      <hemisphereLight args={["#FFF6E8", "#C9BFA8", 0.6]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 7, 6]} intensity={1.4} />
      <directionalLight position={[-5, 3, -4]} intensity={0.35} color="#DCE8FF" />

      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.6} position={[0, 6, 4]} rotation={[-Math.PI / 2, 0, 0]} scale={[10, 7, 1]} />
        <Lightformer form="rect" intensity={0.6} position={[-6, 2, 3]} rotation={[0, Math.PI / 2, 0]} scale={[7, 5, 1]} color="#FFF3E4" />
      </Environment>

      {BOXES.map(([x, y, z, s, itemId, speed], i) => (
        <Float key={itemId} speed={speed} rotationIntensity={0.5} floatIntensity={0.9}>
          <group position={[x, y, z]} rotation={[0.3, i * 0.9, 0.14]} scale={s}>
            <GiftBox itemId={itemId} />
          </group>
        </Float>
      ))}

      <ContactShadows position={[0, -1.85, 0]} scale={14} blur={2.6} far={4} opacity={0.32} color="#4A4438" resolution={512} />
    </Canvas>
  );
}
