'use client';

/**
 * Lighting - Scene lighting configuration with time of day support
 * @param {string} preset - Lighting preset: 'day' | 'sunset' | 'night'
 */
interface LightingProps {
  preset?: any;
}

export default function Lighting({  preset = 'day'  }: LightingProps) {
    const configs = {
        day: {
            ambient: 0.6,
            sun: {
                intensity: 1.5,
                position: [10, 20, 10],
                color: '#ffffff'
            },
            fill: {
                intensity: 0.4,
                color: '#e6f2ff'
            }
        },
        sunset: {
            ambient: 0.4,
            sun: {
                intensity: 1.2,
                position: [15, 8, 5],
                color: '#ffaa66'
            },
            fill: {
                intensity: 0.5,
                color: '#ff8844'
            }
        },
        night: {
            ambient: 0.2,
            sun: {
                intensity: 0.3,
                position: [5, 15, 5],
                color: '#aaccff'
            },
            fill: {
                intensity: 0.6,
                color: '#6688aa'
            }
        }
    };

    const config = configs[preset] || configs.day;

    return (
        <>
            {/* Ambient light */}
            <ambientLight intensity={config.ambient} />

            {/* Main directional light (sun/moon) */}
            <directionalLight
                position={config.sun.position}
                intensity={config.sun.intensity}
                color={config.sun.color}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
            />

            {/* Fill light */}
            <directionalLight
                position={[-10, 10, -10]}
                intensity={config.fill.intensity}
                color={config.fill.color}
            />

            {/* Rim light for depth */}
            <pointLight
                position={[0, 15, 0]}
                intensity={0.3}
                color="#ffffff"
            />

            {/* Underwater glow (subtle) */}
            <pointLight
                position={[0, -1, 0]}
                intensity={0.5}
                color="#00aaff"
                distance={10}
            />
        </>
    );
}
