
'use client';

import * as React from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

function Shield() {
  const meshRef = React.useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 1]} />
      <meshStandardMaterial
        color="#7c3aed"
        emissive="#a855f7"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function OrbitingElement({
  distance,
  speed,
  size,
}: {
  distance: number;
  speed: number;
  size: number;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * speed;
      meshRef.current.position.x = distance * Math.cos(t);
      meshRef.current.position.z = distance * Math.sin(t);
      meshRef.current.position.y = distance * Math.sin(t * 0.5) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color="#a78bfa"
        emissive="#8b5cf6"
        emissiveIntensity={2}
      />
    </mesh>
  );
}

function Particles() {
  const count = 5000;
  const positions = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return positions;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#c4b5fd" />
    </points>
  );
}


function CameraAnimation() {
    useFrame(({ camera, clock }) => {
      camera.position.z = 10 + Math.sin(clock.getElapsedTime() * 0.2) * 2;
      camera.lookAt(0, 0, 0);
    });
    return null;
}

export function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
       <directionalLight position={[-5, -5, -5]} intensity={1} color="#4c1d95" />
      <Shield />
      <OrbitingElement distance={3.5} speed={0.5} size={0.1} />
      <OrbitingElement distance={4.5} speed={0.3} size={0.15} />
      <OrbitingElement distance={5.5} speed={0.2} size={0.08} />
      <Particles />
      <CameraAnimation />
    </Canvas>
  );
}
