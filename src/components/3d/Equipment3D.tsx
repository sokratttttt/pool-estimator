'use client';
import { Html } from '@react-three/drei';
import { useState } from 'react';
import * as THREE from 'three';

/**
 * Equipment3D - Renders pool equipment
 * @param {string} type - Equipment type: 'filter' | 'heater' | 'ladder' | 'light' | 'skimmer'
 * @param {Array} position - [x, y, z] position
 * @param {Array} rotation - [x, y, z] rotation
 */
interface Equipment3DProps {
    type?: any;
    position?: any;
    rotation?: any;
}

export default function Equipment3D({ type, position = [0, 0, 0], rotation = [0, 0, 0] }: Equipment3DProps) {
    const [hovered, setHovered] = useState(false);

    const renderModel = () => {
        switch (type) {
            case 'filter':
                return FilterModel();
            case 'heater':
                return HeaterModel();
            case 'ladder':
                return LadderModel();
            case 'light':
                return LightModel();
            case 'skimmer':
                return SkimmerModel();
            default:
                return null;
        }
    };

    return (
        <group
            position={position}
            rotation={rotation}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            {renderModel()}

            {hovered && (
                <Html position={[0, 1, 0]} center>
                    <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap backdrop-blur-sm border border-white/20">
                        {getLabel(type)}
                    </div>
                </Html>
            )}
        </group>
    );
}

function getLabel(type: any) {
    const labels: Record<string, string> = {
        filter: 'Фильтровальная установка',
        heater: 'Нагреватель',
        ladder: 'Лестница',
        light: 'Прожектор',
        skimmer: 'Скиммер'
    };
    return labels[type] || type;
}

// --- Procedural Models ---

function FilterModel() {
    return (
        <group>
            {/* Tank Body */}
            <mesh position={[0, 0.4, 0]} castShadow>
                <cylinderGeometry args={[0.25, 0.25, 0.8, 32]} />
                <meshStandardMaterial color="#333" roughness={0.4} metalness={0.3} />
            </mesh>
            {/* Base Stand */}
            <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            {/* Top Valve Selector */}
            <group position={[0, 0.85, 0]}>
                <mesh>
                    <cylinderGeometry args={[0.12, 0.15, 0.2, 16]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                {/* Handle */}
                <mesh position={[0, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                {/* Pressure Gauge */}
                <mesh position={[0.1, 0.05, 0]} rotation={[0, 0, -Math.PI / 4]}>
                    <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
                    <meshStandardMaterial color="#ccc" metalness={0.8} />
                </mesh>
            </group>
            {/* Piping Connections */}
            <mesh position={[0.2, 0.7, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
    );
}

function HeaterModel() {
    return (
        <group>
            {/* Main Body */}
            <mesh position={[0, 0.3, 0]} castShadow>
                <boxGeometry args={[0.3, 0.5, 0.2]} />
                <meshStandardMaterial color="#e0e0e0" roughness={0.2} metalness={0.5} />
            </mesh>
            {/* Side Panels */}
            <mesh position={[0.16, 0.3, 0]}>
                <boxGeometry args={[0.02, 0.48, 0.18]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[-0.16, 0.3, 0]}>
                <boxGeometry args={[0.02, 0.48, 0.18]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            {/* Display Panel */}
            <mesh position={[0, 0.45, 0.11]}>
                <planeGeometry args={[0.2, 0.08]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            {/* Digital Readout */}
            <mesh position={[0, 0.45, 0.111]}>
                <planeGeometry args={[0.1, 0.04]} />
                <meshStandardMaterial color="#0f0" emissive="#0f0" emissiveIntensity={0.5} />
            </mesh>
        </group>
    );
}

function LadderModel() {
    // Create curved rail path
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1.2, 0),
        new THREE.Vector3(0, 1.4, -0.2),
        new THREE.Vector3(0, 1.4, -0.5),
        new THREE.Vector3(0, 0, -0.5)
    ]);

    const railMaterial = <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />;

    return (
        <group>
            {/* Left Rail */}
            <mesh position={[-0.25, 0, 0]}>
                <tubeGeometry args={[curve, 20, 0.02, 8, false]} />
                {railMaterial}
            </mesh>
            {/* Right Rail */}
            <mesh position={[0.25, 0, 0]}>
                <tubeGeometry args={[curve, 20, 0.02, 8, false]} />
                {railMaterial}
            </mesh>

            {/* Steps */}
            {[0.3, 0.6, 0.9].map((y: any, i: number) => (
                <group key={i} position={[0, y, 0]}>
                    {/* Step Plate */}
                    <mesh>
                        <boxGeometry args={[0.5, 0.02, 0.08]} />
                        <meshStandardMaterial color="#fff" roughness={0.5} />
                    </mesh>
                    {/* Anti-slip pads */}
                    <mesh position={[0, 0.011, 0]}>
                        <planeGeometry args={[0.4, 0.05]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

function LightModel() {
    return (
        <group rotation={[Math.PI / 2, 0, 0]}>
            {/* Outer Ring */}
            <mesh>
                <torusGeometry args={[0.12, 0.02, 16, 32]} />
                <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Housing */}
            <mesh position={[0, 0, -0.02]}>
                <cylinderGeometry args={[0.12, 0.1, 0.05, 32]} />
                <meshStandardMaterial color="#fff" />
            </mesh>
            {/* Glass Lens */}
            <mesh position={[0, 0, 0.01]}>
                <sphereGeometry args={[0.1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.2]} />
                <meshStandardMaterial
                    color="#fff"
                    emissive="#fff"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.9}
                    toneMapped={false}
                />
            </mesh>
            {/* Light Source */}
            <pointLight distance={4} intensity={2} color="#eef" decay={2} />
        </group>
    );
}

function SkimmerModel() {
    return (
        <group>
            {/* Face Plate */}
            <mesh position={[0, 0, 0.01]}>
                <boxGeometry args={[0.25, 0.2, 0.02]} />
                <meshStandardMaterial color="#fff" />
            </mesh>
            {/* Throat Opening */}
            <mesh position={[0, 0.02, 0.02]}>
                <boxGeometry args={[0.2, 0.12, 0.01]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            {/* Flap (Weir) */}
            <mesh position={[0, -0.03, 0.02]} rotation={[Math.PI / 6, 0, 0]}>
                <boxGeometry args={[0.18, 0.08, 0.005]} />
                <meshStandardMaterial color="#ccc" />
            </mesh>
        </group>
    );
}
