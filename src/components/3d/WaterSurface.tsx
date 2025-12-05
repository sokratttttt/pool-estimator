'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * WaterSurface - Animated water surface with waves
 * @param {number} length - Pool length
 * @param {number} width - Pool width
 * @param {string} shape - Pool shape: 'rectangular' | 'oval'
 */
interface WaterSurfaceProps {
    length?: any;
    width?: any;
    shape?: any;
}

export default function WaterSurface({ length = 10, width = 5, shape = 'rectangular' }: WaterSurfaceProps) {
    const waterRef = useRef<any>(null);
    const waveSpeed = 0.5;
    const waveHeight = 0.05;

    // Animate water waves
    useFrame((state: any) => {
        if (waterRef.current) {
            const time = state.clock.getElapsedTime();
            const geometry = waterRef.current.geometry;
            const positions = geometry.attributes.position;

            // Create wave effect
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);

                // Multiple wave frequencies for realistic effect
                const wave1 = Math.sin(x * 0.5 + time * waveSpeed) * waveHeight;
                const wave2 = Math.sin(y * 0.3 + time * waveSpeed * 0.7) * waveHeight * 0.5;
                const wave3 = Math.sin((x + y) * 0.2 + time * waveSpeed * 1.3) * waveHeight * 0.3;

                positions.setZ(i, wave1 + wave2 + wave3);
            }

            positions.needsUpdate = true;
            geometry.computeVertexNormals();
        }
    });

    // Create geometry based on shape
    const geometry = shape === 'oval'
        ? createOvalWater(length, width)
        : createRectangularWater(length, width);

    return (
        <mesh
            ref={waterRef}
            rotation-x={-Math.PI / 2}
            position={[0, -0.05, 0]}
            receiveShadow
        >
            <primitive object={geometry} attach="geometry" />
            <MeshReflectorMaterial
                color="#0077BE"
                transparent
                opacity={0.85}
                roughness={0.1}
                metalness={0.9}
                blur={[512, 512]}
                mixBlur={1}
                mixStrength={0.5}
                resolution={512}
                mirror={0.3}
                depthScale={0.01}
                minDepthThreshold={0.9}
                maxDepthThreshold={1}
            />
        </mesh>
    );
}

/**
 * Create rectangular water geometry
 */
function createRectangularWater(length: any, width: any) {
    const wallThickness = 0.3;
    const geometry = new THREE.PlaneGeometry(
        width - wallThickness * 2,
        length - wallThickness * 2,
        24,
        24
    );

    return geometry;
}

/**
 * Create oval water geometry
 */
function createOvalWater(length: any, width: any) {
    const wallThickness = 0.3;
    const radiusX = (width - wallThickness * 2) / 2;
    const radiusY = (length - wallThickness * 2) / 2;

    // Create circular geometry
    const geometry = new THREE.PlaneGeometry(
        radiusX * 2,
        radiusY * 2,
        24,
        24
    );

    // Modify vertices to create ellipse
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);

        // Check if point is outside ellipse
        const ellipseTest = (x * x) / (radiusX * radiusX) + (y * y) / (radiusY * radiusY);

        if (ellipseTest > 1) {
            // Move vertices outside ellipse to the edge
            const angle = Math.atan2(y, x);
            positions.setX(i, Math.cos(angle) * radiusX * 0.99);
            positions.setY(i, Math.sin(angle) * radiusY * 0.99);
        }
    }

    positions.needsUpdate = true;
    return geometry;
}
