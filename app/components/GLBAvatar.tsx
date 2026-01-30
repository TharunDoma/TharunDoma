"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface GLBAvatarProps {
  glbData: string; // base64 encoded GLB file
  onAvatarClick?: () => void;
  width?: number;
  height?: number;
}

export default function GLBAvatar({ 
  glbData, 
  onAvatarClick,
  width = 200,
  height = 300 
}: GLBAvatarProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current || !glbData) return;

    setLoading(true);
    setError(null);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 3);
    camera.lookAt(0, 1, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Load GLB
    const loader = new GLTFLoader();
    let mixer: THREE.AnimationMixer | null = null;
    let model: THREE.Object3D | null = null;

    // Convert base64 to blob
    const base64Data = glbData.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);

    loader.load(
      url,
      (gltf) => {
        model = gltf.scene;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        // Scale to fit
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.setScalar(scale);

        scene.add(model);

        // Setup animations
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          
          // Play the first animation (usually walking)
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        setLoading(false);
        URL.revokeObjectURL(url);
      },
      undefined,
      (err) => {
        console.error('GLB loading error:', err);
        setError('Failed to load 3D avatar');
        setLoading(false);
        URL.revokeObjectURL(url);
      }
    );

    // Animation loop
    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (mixer) {
        mixer.update(delta);
      }

      // Slowly rotate the avatar
      if (model) {
        model.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle click
    const handleClick = () => {
      if (onAvatarClick) {
        onAvatarClick();
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener('click', handleClick);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [glbData, onAvatarClick, width, height]);

  return (
    <div className="relative">
      {loading && (
        <div 
          style={{ width: `${width}px`, height: `${height}px` }}
          className="flex items-center justify-center bg-slate-900/50 rounded-lg"
        >
          <div className="text-white text-sm">Loading avatar...</div>
        </div>
      )}
      {error && (
        <div 
          style={{ width: `${width}px`, height: `${height}px` }}
          className="flex items-center justify-center bg-red-900/20 rounded-lg border border-red-500"
        >
          <div className="text-red-400 text-sm">{error}</div>
        </div>
      )}
      <div 
        ref={mountRef} 
        className={`rounded-lg overflow-hidden ${onAvatarClick ? 'cursor-pointer hover:opacity-90 transition' : ''}`}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          display: loading || error ? 'none' : 'block'
        }}
      />
    </div>
  );
}
