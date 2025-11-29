'use client';
import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * PoolShape - Dynamic pool geometry generator
 * @param {number} length - Pool length in meters
 * @param {number} width - Pool width in meters
 * @param {number} depth - Pool depth in meters
 * @param {string} shape - Pool shape: 'rectangular' | 'oval'
 * @param {string} material - Material type: 'concrete' | 'composite' | 'liner'
 */
export default function PoolShape({ length = 10, width = 5, depth = 1.5, shape = 'rectangular', material = 'concrete' }) {

    // Generate geometry based on shape
    const geometry = useMemo(() => {
        switch (shape) {
            case 'rectangular':
                return createRectangularPool(length, width, depth);
            case 'oval':
                return createOvalPool(length, width, depth);
            default:
                return createRectangularPool(length, width, depth);
        }
    }, [length, width, depth, shape]);

    // Get material configuration
    const materialConfig = useMemo(() => getMaterialConfig(material), [material]);

    return (
        <group>
            {/* Pool walls and floor */}
            <mesh geometry={geometry} receiveShadow castShadow>
                <meshStandardMaterial
                    {...materialConfig}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Water level indicator (helper) */}
            <mesh position={[0, -0.1, 0]} receiveShadow>
                <boxGeometry args={[width - 0.2, 0.05, length - 0.2]} />
                <meshStandardMaterial
                    color="#00BFFF"
                    transparent
                    opacity={0.3}
                />
            </mesh>
        </group>
    );
}

/**
 * Creates rectangular pool with walls
 */
function createRectangularPool(length, width, depth) {
    const shape = new THREE.Shape();

    // Outer boundary
    shape.moveTo(-width / 2, -length / 2);
    shape.lineTo(width / 2, -length / 2);
    shape.lineTo(width / 2, length / 2);
    shape.lineTo(-width / 2, length / 2);
    shape.lineTo(-width / 2, -length / 2);

    // Inner boundary (walls thickness: 0.3m)
    const wallThickness = 0.3;
    const hole = new THREE.Path();
    hole.moveTo(-width / 2 + wallThickness, -length / 2 + wallThickness);
    hole.lineTo(width / 2 - wallThickness, -length / 2 + wallThickness);
    hole.lineTo(width / 2 - wallThickness, length / 2 - wallThickness);
    hole.lineTo(-width / 2 + wallThickness, length / 2 - wallThickness);
    hole.lineTo(-width / 2 + wallThickness, -length / 2 + wallThickness);
    shape.holes.push(hole);

    // Extrude to create depth
    const extrudeSettings = {
        depth: depth,
        bevelEnabled: false
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Rotate to be horizontal
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, -depth / 2, 0);

    return geometry;
}

/**
 * Creates oval/elliptical pool
 */
function createOvalPool(length, width, depth) {
    const shape = new THREE.Shape();
    const radiusX = width / 2;
    const radiusY = length / 2;

    // Outer ellipse
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const x = Math.cos(angle) * radiusX;
        const y = Math.sin(angle) * radiusY;
        if (i === 0) {
            shape.moveTo(x, y);
        } else {
            shape.lineTo(x, y);
        }
    }

    // Inner ellipse (wall thickness: 0.3m)
    const wallThickness = 0.3;
    const hole = new THREE.Path();
    const innerRadiusX = radiusX - wallThickness;
    const innerRadiusY = radiusY - wallThickness;

    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const x = Math.cos(angle) * innerRadiusX;
        const y = Math.sin(angle) * innerRadiusY;
        if (i === 0) {
            hole.moveTo(x, y);
        } else {
            hole.lineTo(x, y);
        }
    }
    shape.holes.push(hole);

    // Extrude
    const extrudeSettings = {
        depth: depth,
        bevelEnabled: false
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Rotate and position
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, -depth / 2, 0);

    return geometry;
}

/**
 * Material configurations with enhanced properties
 */
function getMaterialConfig(type) {
    const materials = {
        concrete: {
            color: '#B0B0B0',
            roughness: 0.85,
            metalness: 0.05,
            // Slight color variation for concrete
            emissive: '#2a2a2a',
            emissiveIntensity: 0.02
        },
        composite: {
            color: '#5AA3D9',
            roughness: 0.25,
            metalness: 0.3,
            // Slight shine for composite
            emissive: '#1a4d7a',
            emissiveIntensity: 0.05,
            clearcoat: 0.3,
            clearcoatRoughness: 0.2
        },
        liner: {
            color: '#40C0FF',
            roughness: 0.08,
            metalness: 0.6,
            // Glossy liner material
            emissive: '#0080c0',
            emissiveIntensity: 0.08,
            clearcoat: 0.8,
            clearcoatRoughness: 0.1
        }
    };

    return materials[type] || materials.concrete;
}
