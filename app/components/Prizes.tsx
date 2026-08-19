"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";
import GiftBox, { HALF } from "./GiftBox";
import { PRIZE_INSTANCES } from "../lib/items";
import { prizeBodies } from "../lib/store";

export default function Prizes() {
  return (
    <>
      {PRIZE_INSTANCES.map(({ key, itemId, pos }) => (
        <RigidBody
          key={key}
          ref={(body) => {
            if (body) prizeBodies.set(key, body);
            else prizeBodies.delete(key);
          }}
          position={pos}
          colliders={false}
          linearDamping={0.6}
          angularDamping={0.8}
          restitution={0.05}
        >
          {/* one explicit box beats auto-generating a collider per child mesh */}
          <CuboidCollider args={HALF} />
          <GiftBox itemId={itemId} />
        </RigidBody>
      ))}
    </>
  );
}
