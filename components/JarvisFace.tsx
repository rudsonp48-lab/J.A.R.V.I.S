'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface JarvisFaceProps {
  audioLevel: number;
  status: string;
}

// Global flag to track WebGL failure across re-renders
let webglFailedGlobally = false;

export default function JarvisFace({ audioLevel, status }: JarvisFaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const frameRef = useRef<number>(0);
  const canvas2DRef = useRef<HTMLCanvasElement | null>(null);
  const audioLevelRef = useRef(audioLevel);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  // Grid dimensions
  const GRID_SIZE = 80;
  const PARTICLE_COUNT = GRID_SIZE * GRID_SIZE;

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const isWebGLAvailable = () => {
      if (typeof window === 'undefined') return false;
      if (webglFailedGlobally) return false;
      
      // Check if we've previously failed on this device
      if (localStorage.getItem('jarvis_webgl_disabled') === 'true') {
        return false;
      }

      try {
        const canvas = document.createElement('canvas');
        // Use a very minimal check first
        const gl = canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true }) || 
                   canvas.getContext('experimental-webgl', { failIfMajorPerformanceCaveat: true });
        
        if (!gl) {
          localStorage.setItem('jarvis_webgl_disabled', 'true');
          return false;
        }
        return true;
      } catch (e) {
        localStorage.setItem('jarvis_webgl_disabled', 'true');
        return false;
      }
    };

    // --- WebGL Initialization ---
    let renderer: THREE.WebGLRenderer | null = null;
    if (isWebGLAvailable()) {
      try {
        renderer = new THREE.WebGLRenderer({ 
          alpha: true, 
          antialias: false, 
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Initialize Scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Initialize Camera
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.z = 100;
        cameraRef.current = camera;

        // Create Particle Grid
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const sizes = new Float32Array(PARTICLE_COUNT);

        const spacing = 1.5;
        const offset = (GRID_SIZE * spacing) / 2;

        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            const index = (i * GRID_SIZE + j) * 3;
            positions[index] = i * spacing - offset;
            positions[index + 1] = j * spacing - offset;
            positions[index + 2] = 0;

            colors[index] = 0;
            colors[index + 1] = 0.82;
            colors[index + 2] = 1;

            sizes[i * GRID_SIZE + j] = 1.0;
          }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
          size: 1.5,
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);
        pointsRef.current = points;

        const animate = () => {
          frameRef.current = requestAnimationFrame(animate);
          
          if (!pointsRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;

          const time = Date.now() * 0.001;
          const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
          const sizeAttr = pointsRef.current.geometry.getAttribute('size') as THREE.BufferAttribute;
          const colorAttr = pointsRef.current.geometry.getAttribute('color') as THREE.BufferAttribute;

          const isOnline = status === 'ONLINE' || status === 'SPEAKING';
          const isConnecting = status === 'CONNECTING...';
          const isError = status === 'ERROR';

          for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
              const x = i * spacing - offset;
              const y = j * spacing - offset;

              const distFromCenter = Math.sqrt(x * x + (y * 1.2) * (y * 1.2));
              const faceRadius = 35;
              let z = 0;

              if (distFromCenter < faceRadius) {
                z = Math.sqrt(faceRadius * faceRadius - distFromCenter * distFromCenter) * 0.8;
                
                const eyeY = 15;
                const eyeX = 12;
                const eyeDistL = Math.sqrt((x + eyeX) ** 2 + (y - eyeY) ** 2);
                const eyeDistR = Math.sqrt((x - eyeX) ** 2 + (y - eyeY) ** 2);
                
                if (eyeDistL < 8 || eyeDistR < 8) z -= 5;

                const noseWidth = 4;
                if (Math.abs(x) < noseWidth && y < 10 && y > -10) z += 3;

                const mouthY = -15;
                const mouthDist = Math.sqrt(x * x + (y - mouthY) ** 2 * 2);
                if (mouthDist < 10) {
                  const mouthOpen = isOnline ? audioLevelRef.current * 15 : 0;
                  z -= mouthOpen * (1 - mouthDist / 10);
                }
              }

              const breathing = Math.sin(time * 1.5) * 1.5;
              const tiltAngle = Math.sin(time * 0.4) * 0.15;
              const nodAngle = Math.cos(time * 0.6) * 0.1;
              const lookAngle = Math.sin(time * 0.2) * 0.2;

              let rx = x * Math.cos(lookAngle) - z * Math.sin(lookAngle);
              let rz = x * Math.sin(lookAngle) + z * Math.cos(lookAngle);
              let ry = y * Math.cos(nodAngle) - rz * Math.sin(nodAngle);
              rz = y * Math.sin(nodAngle) + rz * Math.cos(nodAngle);

              const finalX = rx * Math.cos(tiltAngle) - ry * Math.sin(tiltAngle);
              const finalY = rx * Math.sin(tiltAngle) + ry * Math.cos(tiltAngle);

              posAttr.setXYZ(i * GRID_SIZE + j, finalX, finalY, rz + breathing);

              let r = 0, g = 0.82, b = 1;
              if (isError) { r = 1; g = 0.2; b = 0.2; }
              else if (isConnecting) { r = 1; g = 0.8; b = 0; }

              const pulse = isOnline ? audioLevelRef.current * 0.5 : 0;
              colorAttr.setXYZ(i * GRID_SIZE + j, r + pulse, g + pulse, b + pulse);
              sizeAttr.setX(i * GRID_SIZE + j, 1.0 + pulse * 2);
            }
          }

          posAttr.needsUpdate = true;
          sizeAttr.needsUpdate = true;
          colorAttr.needsUpdate = true;

          pointsRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
          pointsRef.current.rotation.x = Math.cos(time * 0.1) * 0.05;

          rendererRef.current.render(sceneRef.current, cameraRef.current);
        };

        animate();
      } catch (e) {
        console.warn("WebGL initialization failed, using Canvas 2D fallback", e);
        webglFailedGlobally = true;
        localStorage.setItem('jarvis_webgl_disabled', 'true');
        setupCanvas2DFallback(width, height);
      }
    } else {
      if (!webglFailedGlobally) {
        console.warn("WebGL not available or performance caveat detected, using Canvas 2D fallback");
      }
      setupCanvas2DFallback(width, height);
    }

    function setupCanvas2DFallback(w: number, h: number) {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      containerRef.current?.appendChild(canvas);
      canvas2DRef.current = canvas;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const FALLBACK_GRID = 40; // Smaller grid for 2D performance
      const spacing = w / FALLBACK_GRID;

      const animate2D = () => {
        frameRef.current = requestAnimationFrame(animate2D);
        ctx.clearRect(0, 0, w, h);
        
        const time = Date.now() * 0.001;
        const isOnline = status === 'ONLINE' || status === 'SPEAKING';
        const isError = status === 'ERROR';
        const isConnecting = status === 'CONNECTING...';

        ctx.fillStyle = isError ? '#ff3333' : isConnecting ? '#ffcc00' : '#00d2ff';
        const pulse = isOnline ? audioLevelRef.current * 10 : 0;

        for (let i = 0; i < FALLBACK_GRID; i++) {
          for (let j = 0; j < FALLBACK_GRID; j++) {
            const x = i * spacing;
            const y = j * spacing;
            
            const dx = x - w / 2;
            const dy = y - h / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < w / 3) {
              const wave = Math.sin(dist * 0.05 - time * 5) * 2;
              const size = (1 + Math.sin(time + dist * 0.1)) * 1 + pulse;
              
              ctx.globalAlpha = 0.3 + Math.sin(time + dist * 0.05) * 0.2;
              ctx.beginPath();
              ctx.arc(x + wave, y + wave, size, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      };
      animate2D();
    }

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.setSize(w, h);
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
      }
      if (canvas2DRef.current) {
        canvas2DRef.current.width = w;
        canvas2DRef.current.height = h;
      }
    };

    const container = containerRef.current;
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      if (container) {
        if (rendererRef.current) container.removeChild(rendererRef.current.domElement);
        if (canvas2DRef.current) container.removeChild(canvas2DRef.current);
      }
    };
  }, [status, PARTICLE_COUNT]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative"
      style={{ filter: 'drop-shadow(0 0 15px rgba(0, 210, 255, 0.4))' }}
    >
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] z-10 opacity-30"></div>
    </div>
  );
}
