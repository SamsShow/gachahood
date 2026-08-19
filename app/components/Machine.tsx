"use client";

import { useLayoutEffect } from "react";
import { useGLTF, Text } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { BackSide, Mesh } from "three";
import { GREEN, PIT_FLOOR } from "../lib/palette";

// The cabinet is modelled with its pit floor at y=0.15; drop it so prizes rest at y=0.
const SHIFT = -0.15;

// Invisible fixed volumes: [x, y, z, width, height, depth].
// Pit spans x,z in [-1.63, 1.63]; the chute hole is the x<-0.85, z>0.85 corner.
const COLLIDERS: [number, number, number, number, number, number][] = [
  [0, -0.05, -0.39, 3.26, 0.1, 2.48], // pit floor behind the chute row
  [0.39, -0.05, 1.24, 2.48, 0.1, 0.78], // pit floor front strip
  [-1.68, 1.5, 0, 0.1, 3, 3.46], // pit walls (the glass is visual only)
  [1.68, 1.5, 0, 0.1, 3, 3.46],
  [0, 1.5, -1.68, 3.46, 3, 0.1],
  [0, 1.5, 1.68, 3.46, 3, 0.1],
  [-1.675, -0.7, 1.25, 0.05, 1.4, 0.8], // chute shaft
  [-0.825, -0.7, 1.25, 0.05, 1.4, 0.8],
  [-1.25, -0.7, 0.825, 0.8, 1.4, 0.05],
  [-1.25, -0.7, 1.675, 0.8, 1.4, 0.05],
  [-1.25, -1.45, 1.25, 0.9, 0.1, 0.9], // catch tray
];

// Visible pit floor, widened past the colliders to cover the cabinet's sill ledge.
const DECK: [number, number, number, number, number, number][] = [
  [0, -0.04, -0.44, 3.44, 0.1, 2.58],
  [0.435, -0.04, 1.285, 2.57, 0.1, 0.88],
];

export default function Machine() {
  const { scene } = useGLTF("/cabinet.glb");

  useLayoutEffect(() => {
    scene.traverse((o) => {
      if ((o as Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid" includeInvisible>
        {COLLIDERS.map(([x, y, z, w, h, d], i) => (
          <mesh key={i} position={[x, y, z]} visible={false}>
            <boxGeometry args={[w, h, d]} />
          </mesh>
        ))}
      </RigidBody>

      <primitive object={scene} position={[0, SHIFT, 0]} />

      {DECK.map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y, z]} receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={PIT_FLOOR} roughness={0.85} />
        </mesh>
      ))}

      {/* green lip framing the chute hole */}
      <mesh position={[-0.85, 0.03, 1.24]}>
        <boxGeometry args={[0.05, 0.06, 0.83]} />
        <meshStandardMaterial color={GREEN} roughness={0.4} />
      </mesh>
      <mesh position={[-1.245, 0.03, 0.85]}>
        <boxGeometry args={[0.84, 0.06, 0.05]} />
        <meshStandardMaterial color={GREEN} roughness={0.4} />
      </mesh>

      {/* dark liner so the shaft reads as a hole, not a green pocket */}
      <mesh position={[-1.25, -0.75, 1.25]}>
        <boxGeometry args={[0.78, 1.5, 0.78]} />
        <meshStandardMaterial color="#14171A" roughness={0.9} side={BackSide} />
      </mesh>

      {/* opaque interior back — gives the cabinet depth instead of showing the room through it */}
      <mesh position={[0, 1.4, -1.7]} receiveShadow>
        <planeGeometry args={[3.44, 2.8]} />
        <meshStandardMaterial color="#F7F3EA" roughness={0.9} />
      </mesh>

      {/* glass */}
      {([
        [-1.715, 0, Math.PI / 2],
        [1.715, 0, -Math.PI / 2],
        [0, 1.715, 0],
      ] as const).map(([x, z, ry], i) => (
        <mesh key={i} position={[x, 1.4, z]} rotation={[0, ry, 0]}>
          <planeGeometry args={[3.44, 2.8]} />
          <meshPhysicalMaterial
            color="#EAF4EE"
            transparent
            opacity={0.16}
            roughness={0.03}
            metalness={0}
            depthWrite={false}
            side={2}
          />
        </mesh>
      ))}

      <Text
        position={[0, 3.49, 1.84]}
        font="/fonts/outfit-700.ttf"
        fontSize={0.21}
        color={GREEN}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
      >
        GACHAHOOD
      </Text>
    </group>
  );
}

useGLTF.preload("/cabinet.glb");
