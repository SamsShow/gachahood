"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { useGame, input, prizeBodies, CHUTE } from "../lib/store";
import { PRIZE_INSTANCES, itemById } from "../lib/items";
import { GRAPHITE, GREEN } from "../lib/palette";

const RAIL_Y = 2.62;
const REST_Y = 2.05;
const DROP_Y = 0.62;
const SPEED = 1.6;
const VSPEED = 1.7;
const CLAMP = 1.25;
const GRAB_RADIUS = 0.55;
const HOLD_OFFSET = 0.45;

const clamp = (v: number) => Math.max(-CLAMP, Math.min(CLAMP, v));

export default function Claw() {
  const head = useRef<Group>(null);
  const cable = useRef<Mesh>(null);
  const rail = useRef<Mesh>(null);
  const trolley = useRef<Mesh>(null);
  const fingers = useRef<(Group | null)[]>([]);
  const pos = useRef({ x: 0, y: REST_Y, z: 0 });
  const close = useRef(0); // 0 open .. 1 closed
  const grabbed = useRef<number | null>(null); // prize key
  const released = useRef<{ key: number; t: number } | null>(null);
  // height at which the grip gives out on this pull; null means the claw holds
  const slipAt = useRef<number | null>(null);
  const slipped = useRef(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key))
        e.preventDefault();
      if (e.key === "ArrowLeft" || e.key === "a") input.left = true;
      if (e.key === "ArrowRight" || e.key === "d") input.right = true;
      if (e.key === "ArrowUp" || e.key === "w") input.fwd = true;
      if (e.key === "ArrowDown" || e.key === "s") input.back = true;
      if (e.key === " ") useGame.getState().drop();
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") input.left = false;
      if (e.key === "ArrowRight" || e.key === "d") input.right = false;
      if (e.key === "ArrowUp" || e.key === "w") input.fwd = false;
      if (e.key === "ArrowDown" || e.key === "s") input.back = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const { phase, setPhase, win, miss } = useGame.getState();
    const p = pos.current;

    if (phase === "idle" || phase === "result") {
      const k = Math.min(1, dt * 3);
      p.x += (0 - p.x) * k;
      p.z += (0 - p.z) * k;
      p.y += (REST_Y - p.y) * k;
      close.current = Math.max(0, close.current - dt * 2);
      slipAt.current = null;
      slipped.current = false;
    } else if (phase === "aiming") {
      const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      const dz = (input.back ? 1 : 0) - (input.fwd ? 1 : 0);
      p.x = clamp(p.x + dx * SPEED * dt);
      p.z = clamp(p.z + dz * SPEED * dt);
    } else if (phase === "dropping") {
      p.y -= VSPEED * dt;
      if (p.y <= DROP_Y) {
        p.y = DROP_Y;
        setPhase("grabbing");
      }
    } else if (phase === "grabbing") {
      close.current += dt / 0.35;
      if (close.current >= 1) {
        close.current = 1;
        let bestKey: number | null = null;
        let bestD = GRAB_RADIUS;
        for (const [key, body] of prizeBodies) {
          const t = body.translation();
          if (t.y < -0.2 || t.y > 1.2) continue;
          const d = Math.hypot(t.x - p.x, t.z - p.z);
          if (d < bestD) {
            bestD = d;
            bestKey = key;
          }
        }
        grabbed.current = bestKey;
        // Rarer boxes are harder to hold on to — this is the whole odds mechanic.
        if (bestKey !== null) {
          const { grip } = itemById(PRIZE_INSTANCES[bestKey].itemId);
          slipAt.current =
            Math.random() < grip
              ? null
              : DROP_Y + (REST_Y - DROP_Y) * (0.3 + Math.random() * 0.45);
        }
        setPhase("lifting");
      }
    } else if (phase === "lifting") {
      p.y += VSPEED * dt;
      if (slipAt.current !== null && grabbed.current !== null && p.y >= slipAt.current) {
        grabbed.current = null; // let go — it drops back into the pit
        slipAt.current = null;
        slipped.current = true;
      }
      if (p.y >= REST_Y) {
        p.y = REST_Y;
        if (grabbed.current !== null) setPhase("carrying");
        else miss(slipped.current ? "It slipped out of the claw. So close." : undefined);
      }
    } else if (phase === "carrying") {
      const dx = CHUTE.x - p.x;
      const dz = CHUTE.z - p.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.05) {
        setPhase("releasing");
      } else {
        const s = Math.min(SPEED * dt, d);
        p.x += (dx / d) * s;
        p.z += (dz / d) * s;
      }
    } else if (phase === "releasing") {
      close.current = Math.max(0, close.current - dt / 0.3);
      if (grabbed.current !== null && close.current <= 0.4) {
        released.current = { key: grabbed.current, t: 0 };
        grabbed.current = null;
      }
      if (released.current) {
        released.current.t += dt;
        const { key, t } = released.current;
        const body = prizeBodies.get(key);
        const y = body ? body.translation().y : -1;
        if (y < -0.4) {
          released.current = null;
          // recycle the prize back into the pit so it never runs dry
          if (body) {
            const spawn = PRIZE_INSTANCES[key].pos;
            body.setTranslation({ x: spawn[0], y: 1.6, z: spawn[2] }, true);
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
          }
          win(itemById(PRIZE_INSTANCES[key].itemId));
        } else if (t > 3) {
          // fell short of the chute — no prize
          released.current = null;
          miss("It never made it down the chute. No prize.");
        }
      }
    }

    // held prize follows the claw (teleport the dynamic body each frame)
    if (grabbed.current !== null) {
      const body = prizeBodies.get(grabbed.current);
      if (body) {
        body.setTranslation({ x: p.x, y: p.y - HOLD_OFFSET, z: p.z }, true);
        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      }
    }

    if (head.current) head.current.position.set(p.x, p.y, p.z);
    if (cable.current) {
      const h = RAIL_Y - p.y;
      cable.current.position.set(p.x, RAIL_Y - h / 2, p.z);
      cable.current.scale.y = h;
    }
    if (rail.current) rail.current.position.z = p.z;
    if (trolley.current) trolley.current.position.set(p.x, RAIL_Y, p.z);
    const angle = 0.55 - close.current * 0.5;
    for (const f of fingers.current) if (f) f.rotation.z = angle;
  });

  return (
    <group>
      {/* gantry */}
      <mesh ref={rail} position={[0, RAIL_Y, 0]} castShadow>
        <boxGeometry args={[3.3, 0.1, 0.14]} />
        <meshStandardMaterial color={GRAPHITE} roughness={0.5} />
      </mesh>
      <mesh ref={trolley} position={[0, RAIL_Y, 0]} castShadow>
        <boxGeometry args={[0.3, 0.17, 0.24]} />
        <meshStandardMaterial color={GRAPHITE} roughness={0.45} />
      </mesh>
      <mesh ref={cable} position={[0, (RAIL_Y + REST_Y) / 2, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 1, 8]} />
        <meshStandardMaterial color={GRAPHITE} roughness={0.6} />
      </mesh>

      {/* claw head + three fingers */}
      <group ref={head} position={[0, REST_Y, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.3, 0.24, 28]} />
          <meshStandardMaterial color={GRAPHITE} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.09, 24]} />
          <meshStandardMaterial color={GREEN} roughness={0.35} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
            <group
              ref={(el) => {
                fingers.current[i] = el;
              }}
              position={[0.19, -0.1, 0]}
            >
              <RoundedBox
                args={[0.085, 0.44, 0.12]}
                radius={0.04}
                smoothness={3}
                position={[0, -0.22, 0]}
                castShadow
              >
                <meshStandardMaterial color={GRAPHITE} roughness={0.45} />
              </RoundedBox>
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}
