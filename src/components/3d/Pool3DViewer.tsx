'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { Suspense, forwardRef, useRef, useImperativeHandle } from 'react';
import PoolShape from './PoolShape';
import WaterSurface from './WaterSurface';
import Lighting from './Lighting';
import Equipment3D from './Equipment3D';
import ScreenshotHelper from './ScreenshotHelper';

/**
 * Pool3DViewer - Main 3D visualization component
 * @param {Object} poolData - Pool configuration data
 * @param {string} lighting - Lighting preset: 'day' | 'sunset' | 'night'
 */
interface Pool3DViewerProps {
    poolData?: {
        length?: number;
        width?: number;
        depth?: number;
        shape?: string;
        material?: string;
    };
    lighting?: string;
}

const Pool3DViewer = forwardRef<any, Pool3DViewerProps>(({ poolData = {}, lighting = 'day' }, ref) => {
    const screenshotRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
        takeScreenshot: (filename: any) => {
            return screenshotRef.current?.takeScreenshot(filename);
        }
    }));

    const {
        length = 10,
        width = 5,
        depth = 1.5,
        shape = 'rectangular',
        material = 'concrete'
    } = poolData;

    // Environment preset based on lighting
    const envPreset = lighting === 'night' ? 'night' :
        lighting === 'sunset' ? 'sunset' : 'dawn';

    return (
        <div className="w-full h-full">
            <Canvas
                camera={{ position: [15, 10, 15], fov: 50 }}
                shadows
            >
                {/* Lighting */}
                <Lighting preset={lighting} />

                {/* Environment */}
                <Suspense fallback={null}>
                    <Environment preset={envPreset} />
                </Suspense>

                {/* Grid helper */}
                <Grid
                    args={[20, 20]}
                    cellSize={1}
                    cellThickness={0.5}
                    cellColor="#6f6f6f"
                    sectionSize={5}
                    sectionThickness={1}
                    sectionColor="#9d4b4b"
                    fadeDistance={30}
                    fadeStrength={1}
                    followCamera={false}
                />

                {/* Pool shape */}
                <Suspense fallback={null}>
                    <PoolShape
                        length={length}
                        width={width}
                        depth={depth}
                        shape={shape}
                        material={material}
                    />

                    {/* Water surface */}
                    <WaterSurface
                        length={length}
                        width={width}
                        shape={shape}
                    />

                    {/* Equipment - Auto-positioned */}

                    {/* Ladder - usually at the shallow end or corner */}
                    <Equipment3D
                        type="ladder"
                        position={[width / 2 - 0.5, -depth / 2, length / 2 - 0.5]}
                        rotation={[0, Math.PI, 0]}
                    />

                    {/* Lights - distributed along the long wall */}
                    <Equipment3D
                        type="light"
                        position={[width / 2 - 0.31, -depth / 2, 0]}
                        rotation={[0, -Math.PI / 2, 0]}
                    />
                    {length > 6 && (
                        <>
                            <Equipment3D
                                type="light"
                                position={[width / 2 - 0.31, -depth / 2, length / 4]}
                                rotation={[0, -Math.PI / 2, 0]}
                            />
                            <Equipment3D
                                type="light"
                                position={[width / 2 - 0.31, -depth / 2, -length / 4]}
                                rotation={[0, -Math.PI / 2, 0]}
                            />
                        </>
                    )}

                    {/* Skimmers - water level */}
                    <Equipment3D
                        type="skimmer"
                        position={[-width / 2 + 0.31, -0.15, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                    />

                    {/* Technical Equipment (outside pool) */}
                    <group position={[width / 2 + 2, 0, -length / 2]}>
                        <Equipment3D type="filter" position={[0, 0, 0]} />
                        <Equipment3D type="heater" position={[1, 0, 0]} />
                    </group>

                </Suspense>

                {/* Camera controls */}
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    maxDistance={30}
                    minDistance={5}
                    maxPolarAngle={Math.PI / 2}
                />

                {/* Screenshot helper */}
                <ScreenshotHelper ref={screenshotRef} />
            </Canvas>
        </div>
    );
});

Pool3DViewer.displayName = 'Pool3DViewer';

export default Pool3DViewer;
