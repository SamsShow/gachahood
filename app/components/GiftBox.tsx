"use client";

import { BoxGeometry, MeshStandardMaterial, TorusGeometry } from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { itemById } from "../lib/items";

// Geometry and materials are shared across every box in the scene — 42 prizes x 5 meshes
// would otherwise allocate 210 buffers and materials for six distinct looks.
// Capped so a tumbling box's diagonal (S * 0.52 * 1.41) still clears the 0.78 chute hole.
const S = 1.18;
const LID_W = 0.44 * S;

export const HALF: [number, number, number] = [LID_W / 2, 0.19 * S, LID_W / 2];

const GEO = {
  body: new RoundedBoxGeometry(0.4 * S, 0.28 * S, 0.4 * S, 3, 0.035 * S),
  lid: new RoundedBoxGeometry(LID_W, 0.1 * S, LID_W, 3, 0.03 * S),
  ribX: new BoxGeometry(0.075 * S, 0.395 * S, 0.455 * S),
  ribZ: new BoxGeometry(0.455 * S, 0.395 * S, 0.075 * S),
  knot: new TorusGeometry(0.07 * S, 0.026 * S, 8, 18),
};

const cache = new Map<string, MeshStandardMaterial>();
const mat = (color: string, metal: boolean) => {
  const key = `${color}:${metal}`;
  let m = cache.get(key);
  if (!m) {
    m = new MeshStandardMaterial({
      color,
      roughness: metal ? 0.28 : 0.55,
      metalness: metal ? 0.65 : 0.05,
    });
    cache.set(key, m);
  }
  return m;
};

export default function GiftBox({ itemId }: { itemId: string }) {
  const { color, trim, metal } = itemById(itemId);
  const body = mat(color, metal ?? false);
  const accent = mat(trim, false);

  return (
    <group>
      <mesh geometry={GEO.body} material={body} position={[0, -0.05 * S, 0]} castShadow receiveShadow />
      <mesh geometry={GEO.lid} material={accent} position={[0, 0.14 * S, 0]} castShadow receiveShadow />
      <mesh geometry={GEO.ribX} material={accent} castShadow />
      <mesh geometry={GEO.ribZ} material={accent} castShadow />
      <mesh
        geometry={GEO.knot}
        material={accent}
        position={[0, 0.2 * S, 0]}
        rotation-x={Math.PI / 2}
        castShadow
      />
    </group>
  );
}
