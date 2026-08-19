"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid, RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import GiftBox from "./GiftBox";
import { BUTTER, FLOOR, GRAPHITE, GREEN, HALO, SKIRT, WALL, WALL_SIDE } from "../lib/palette";

const Y = -2.45; // floor height, flush with the cabinet's toe kick
const CEIL = 5.9;
const BACK = -9;
const SIDE = 10;
const FRONT = 16;

// [x, height, bullish] — a candle run across the back wall
const CANDLES: [number, number, boolean][] = [
  [-7.8, 0.9, true],
  [-6.8, 1.5, true],
  [-5.8, 1.1, false],
  [-4.8, 1.9, true],
  [-3.8, 2.3, true],
  [3.8, 2.5, true],
  [4.8, 2.0, false],
  [5.8, 2.6, true],
  [6.8, 2.2, false],
  [7.8, 2.7, true],
];

function SpinningCoin({
  position,
  r,
  h,
  face,
  rim,
  speed,
}: {
  position: [number, number, number];
  r: number;
  h: number;
  face: string;
  rim: string;
  speed: number;
}) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed;
  });
  return (
    <group ref={ref} position={position}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[r, r, h, 48]} />
          <meshStandardMaterial color={rim} roughness={0.4} metalness={0.15} />
        </mesh>
        {([1, -1] as const).map((side) => (
          <mesh
            key={side}
            position={[0, (side * h) / 2 + side * 0.008, 0]}
            rotation-x={(side * -Math.PI) / 2}
          >
            <circleGeometry args={[r * 0.74, 48]} />
            <meshStandardMaterial color={face} roughness={0.45} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function Room() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, Y, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={FLOOR} roughness={0.95} />
      </mesh>
      <Grid
        position={[0, Y + 0.005, 0]}
        args={[40, 40]}
        cellSize={1.2}
        cellThickness={0.5}
        cellColor="#C9BDA3"
        sectionSize={4.8}
        sectionThickness={1}
        sectionColor="#B6A987"
        fadeDistance={34}
        fadeStrength={1.4}
        followCamera={false}
        infiniteGrid
      />

      {/* walls */}
      <mesh position={[0, (Y + CEIL) / 2, BACK]} receiveShadow>
        <planeGeometry args={[SIDE * 2, CEIL - Y]} />
        <meshStandardMaterial color={WALL} roughness={1} />
      </mesh>
      {([-SIDE, SIDE] as const).map((x) => (
        <mesh
          key={x}
          position={[x, (Y + CEIL) / 2, (BACK + FRONT) / 2]}
          rotation-y={x < 0 ? Math.PI / 2 : -Math.PI / 2}
          receiveShadow
        >
          <planeGeometry args={[FRONT - BACK, CEIL - Y]} />
          <meshStandardMaterial color={WALL_SIDE} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, CEIL, (BACK + FRONT) / 2]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[SIDE * 2, FRONT - BACK]} />
        <meshStandardMaterial
          color="#F4EEE0"
          emissive="#F4EEE0"
          emissiveIntensity={0.6}
          roughness={1}
        />
      </mesh>

      {/* recessed ceiling panels — the only part of the ceiling the camera ever sees */}
      {([-4.6, 0, 4.6] as const).map((x) =>
        ([-5.6, -7.6] as const).map((z) => (
          <mesh key={`${x}:${z}`} position={[x, CEIL - 0.03, z]} rotation-x={Math.PI / 2}>
            <planeGeometry args={[3.4, 1.6]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#FFF4E2"
              emissiveIntensity={0.9}
              roughness={1}
            />
          </mesh>
        ))
      )}

      {/* warm halo so the green cabinet reads against the back wall */}
      <mesh position={[0, 0.7, BACK + 0.04]}>
        <circleGeometry args={[4.6, 72]} />
        <meshStandardMaterial color={HALO} roughness={1} />
      </mesh>

      {/* candlestick run — wick first, then the body over it */}
      {CANDLES.map(([x, h, up]) => (
        <group key={x} position={[x, Y, BACK + 0.5]}>
          <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[0.07, h + 0.45, 0.07]} />
            <meshStandardMaterial color={up ? "#0B7A2E" : "#8A8578"} roughness={0.8} />
          </mesh>
          <RoundedBox args={[0.72, h, 0.28]} radius={0.05} smoothness={3} position={[0, h / 2, 0.06]} castShadow>
            <meshStandardMaterial color={up ? GREEN : GRAPHITE} roughness={0.5} />
          </RoundedBox>
        </group>
      ))}

      {/* skirting — cheap but it's what makes the floor/wall meeting read as a room */}
      <mesh position={[0, Y + 0.11, BACK + 0.09]}>
        <boxGeometry args={[SIDE * 2, 0.22, 0.06]} />
        <meshStandardMaterial color={SKIRT} roughness={0.9} />
      </mesh>
      {([-SIDE + 0.09, SIDE - 0.09] as const).map((x) => (
        <mesh key={x} position={[x, Y + 0.11, (BACK + FRONT) / 2]}>
          <boxGeometry args={[0.06, 0.22, FRONT - BACK]} />
          <meshStandardMaterial color={SKIRT} roughness={0.9} />
        </mesh>
      ))}

      {/* token on edge, right */}
      <SpinningCoin position={[5.8, Y + 1.15, -5.0]} r={1.15} h={0.34} face={GREEN} rim={BUTTER} speed={0.3} />
      <SpinningCoin position={[4.2, Y + 0.5, -2.4]} r={0.5} h={0.18} face={BUTTER} rim={GRAPHITE} speed={-0.55} />

      {/* block stack, left */}
      {([0, 1, 2] as const).map((i) => (
        <group key={i} position={[-5.9 + i * 0.22, Y + 0.62 + i * 1.24, -4.9 - i * 0.14]}>
          <RoundedBox args={[1.24, 1.24, 1.24]} radius={0.11} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color={i === 1 ? GREEN : GRAPHITE} roughness={0.55} />
          </RoundedBox>
          <mesh position={[0, 0, 0.64]}>
            <planeGeometry args={[0.46, 0.46]} />
            <meshStandardMaterial color={i === 1 ? GRAPHITE : GREEN} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* spilled prize boxes and a dropped token */}
      <group position={[3.0, Y + 0.42, 1.5]} rotation={[0, 0.5, 0]} scale={1.85}>
        <GiftBox itemId="bomber" />
      </group>
      <group position={[-3.0, Y + 0.36, 1.3]} rotation={[0, -0.7, 0]} scale={1.6}>
        <GiftBox itemId="whitecap" />
      </group>
      <group position={[-2.1, Y + 0.32, 2.4]} rotation={[0, 0.25, 0]} scale={1.45}>
        <GiftBox itemId="blackcap" />
      </group>
      <mesh position={[-4.1, Y + 0.06, 2.2]} rotation={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.12, 40]} />
        <meshStandardMaterial color={BUTTER} roughness={0.4} metalness={0.15} />
      </mesh>
    </group>
  );
}
