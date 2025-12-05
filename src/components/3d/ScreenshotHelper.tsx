'use client';
import { useThree } from '@react-three/fiber';
import { useImperativeHandle, forwardRef } from 'react';

/**
 * ScreenshotHelper - Component to expose screenshot functionality
 * Must be used inside Canvas
 */
const ScreenshotHelper = forwardRef((_, ref: any) => {
    const { gl, scene, camera } = useThree();

    useImperativeHandle(ref, () => ({
        takeScreenshot: (filename = 'pool-3d.png') => {
            // Render the scene one more time to ensure latest state
            gl.render(scene, camera);

            // Get canvas data as PNG
            const dataURL = gl.domElement.toDataURL('image/png');

            // Create download link
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataURL;
            link.click();

            return dataURL;
        }
    }));

    return null; // This component doesn't render anything
});

ScreenshotHelper.displayName = 'ScreenshotHelper';

export default ScreenshotHelper;
