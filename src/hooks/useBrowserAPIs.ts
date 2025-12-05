import { useState, useEffect, useCallback } from 'react';

/**
 * useGeolocation hook
 * Get user's geolocation
 */
export function useGeolocation(options: PositionOptions = {}): any {
    const [location, setLocation] = useState<any>({
        loading: true,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: null,
        longitude: null,
        speed: null,
        timestamp: null,
        error: null
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation((prev: any) => ({
                ...prev,
                loading: false,
                error: { code: 0, message: 'Geolocation not supported' }
            }));
            return;
        }

        const onSuccess = (position: GeolocationPosition) => {
            setLocation({
                loading: false,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                speed: position.coords.speed,
                timestamp: position.timestamp,
                error: null
            });
        };

        const onError = (error: GeolocationPositionError) => {
            setLocation((prev: any) => ({
                ...prev,
                loading: false,
                error
            }));
        };

        navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    }, [options]);

    return location;
}

export function usePermission(permissionName: PermissionName): any {
    const [state, setState] = useState<any>({
        status: 'pending',
        error: null
    });

    useEffect(() => {
        if (!navigator.permissions) {
            setState({ status: 'unsupported', error: null });
            return;
        }

        navigator.permissions.query({ name: permissionName })
            .then((permission: PermissionStatus) => {
                setState({ status: permission.state, error: null });

                permission.onchange = () => {
                    setState({ status: permission.state, error: null });
                };
            })
            .catch((error: any) => {
                setState({ status: 'error', error });
            });
    }, [permissionName]);

    return state;
}

/**
 * useShare hook
 * Web Share API
 */
export function useShare(): any {
    const [isSupported] = useState(() =>
        typeof navigator !== 'undefined' && !!navigator.share
    );

    const share = useCallback(async ({ title, text, url, files }: any) => {
        if (!isSupported) {
            throw new Error('Web Share API not supported');
        }

        try {
            await navigator.share({ title, text, url, files });
            return { success: true };
        } catch (error: any) {
            if (error.name === 'AbortError') {
                return { success: false, error: 'Share canceled' };
            }
            throw error;
        }
    }, [isSupported]);

    return { share, isSupported };
}

/**
 * useClipboard hook (enhanced)
 */
export function useClipboard({ timeout = 2000 } = {}): any {
    const [isCopied, setIsCopied] = useState(false);

    const copy = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);

            setTimeout(() => {
                setIsCopied(false);
            }, timeout);

            return true;
        } catch (error) {
            console.error('Failed to copy:', error);
            setIsCopied(false);
            return false;
        }
    }, [timeout]);

    const read = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            return text;
        } catch (error) {
            console.error('Failed to read clipboard:', error);
            return null;
        }
    }, []);

    return { isCopied, copy, read };
}
