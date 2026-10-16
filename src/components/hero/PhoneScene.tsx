"use client";

/* eslint-disable react-hooks/immutability -- code impératif
   canvas / three.js : les objets mutés (canvas, texture, caméra) ne sont pas de l'état React. */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type PhoneState = { ry: number; rx: number; y: number };

/** Téléphone 3D procédural (aucun modèle à télécharger) avec l'écran en texture canvas. */
function Phone({
  screen,
  state,
  version,
}: {
  screen: HTMLCanvasElement;
  state: React.RefObject<PhoneState>;
  version: number;
}) {
  const group = useRef<THREE.Group>(null);
  const reduce = useMemo(() => matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const W = 1.25;
  const H = 2.62;
  const R = 0.2;
  const D = 0.12;

  const bodyGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-W / 2 + R, -H / 2);
    s.lineTo(W / 2 - R, -H / 2);
    s.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + R);
    s.lineTo(W / 2, H / 2 - R);
    s.quadraticCurveTo(W / 2, H / 2, W / 2 - R, H / 2);
    s.lineTo(-W / 2 + R, H / 2);
    s.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - R);
    s.lineTo(-W / 2, -H / 2 + R);
    s.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + R, -H / 2);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: D,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 6,
      curveSegments: 24,
    });
    g.translate(0, 0, -D / 2);
    return g;
  }, []);

  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(screen);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [screen]);

  const alpha = useMemo(() => {
    const m = document.createElement("canvas");
    m.width = 128;
    m.height = 268;
    const g = m.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, 128, 268);
    g.fillStyle = "#fff";
    g.beginPath();
    g.roundRect(0, 0, 128, 268, 18);
    g.fill();
    return new THREE.CanvasTexture(m);
  }, []);

  useEffect(() => {
    texture.needsUpdate = true;
  }, [texture, version]);

  useFrame(({ clock }) => {
    const p = group.current;
    if (!p) return;
    const float = reduce ? 0 : Math.sin(clock.elapsedTime * 1.1) * 0.05;
    p.rotation.set(state.current.rx, state.current.ry, 0);
    p.position.y = state.current.y + float;
  });

  return (
    <group ref={group}>
      <mesh geometry={bodyGeo}>
        <meshStandardMaterial color="#2B140A" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, D / 2 + 0.032]}>
        <planeGeometry args={[W - 0.1, H - 0.1]} />
        <meshBasicMaterial map={texture} alphaMap={alpha} transparent toneMapped={false} />
      </mesh>
      <mesh position={[0, H / 2 - 0.13, D / 2 + 0.034]}>
        <planeGeometry args={[0.32, 0.07]} />
        <meshBasicMaterial color="#0b0f14" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.62, 0]} scale={[1.1, 0.35, 1]}>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial color="#2B140A" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

function CameraFit() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.z = size.width < 420 ? 8.4 : 7.2;
    camera.updateProjectionMatrix();
  }, [camera, size.width]);
  return null;
}

export default function PhoneScene({
  screen,
  state,
  version,
}: {
  screen: HTMLCanvasElement;
  state: React.RefObject<PhoneState>;
  version: number;
}) {
  return (
    <Canvas
      camera={{ fov: 32, position: [0, 0, 7.2] }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      aria-hidden="true"
    >
      <CameraFit />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 6]} intensity={1.6} />
      <pointLight position={[-3, -1, 2]} intensity={6} color="#D7C099" distance={12} />
      <pointLight position={[3, 2, -2]} intensity={5} color="#A8C7DE" distance={12} />
      <Phone screen={screen} state={state} version={version} />
    </Canvas>
  );
}
