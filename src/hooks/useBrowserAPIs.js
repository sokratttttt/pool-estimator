import { useState, useEffect, useCallback } from 'react';

/**
 * useGeolocation hook
 * Get user's geolocation
 */
export function useGeolocation(options = {}) {
    const [location, setLocation] = useState({
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
            setLocation(prev => ({
                ...prev,
                loading: false,
                error: { code: 0, message: 'Geolocation not supported' }
            }));
            return;
        }

        const onSuccess = (position) => {
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

        const onError = (error) => {
            setLocation(prev => ({
                ...prev,
                loading: false,
                error
            }));
        };

        navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    }, [options]);

    return location;
}

/**
 * usePermission hook
 * Check browser permissions
 */
export function usePermission(permissionName) {
    const [state, setState] = useState({
        status: 'pending',
        error: null
    });

    useEffect(() => {
        if (!navigator.permissions) {
            setState({ status: 'unsupported', error: null });
            return;
        }

        navigator.permissions.query({ name: permissionName })
            .then(permission => {
                setState({ status: permission.state, error: null });

                permission.onchange = () => {
                    setState({ status: permission.state, error: null });
                };
            })
            .catch(error => {
                setState({ status: 'error', error });
            });
    }, [permissionName]);

    return state;
}

/**
 * useShare hook
 * Web Share API
 */
export function useShare() {
    const [isSupported] = useState(() =>
        typeof navigator !== 'undefined' && !!navigator.share
    );

    const share = useCallback(async ({ title, text, url, files }) => {
        if (!isSupported) {
            throw new Error('Web Share API not supported');
        }

        try {
            await navigator.share({ title, text, url, files });
            return { success: true };
        } catch (error) {
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
export function useClipboard({ timeout = 2000 } = {}) {
    const [isCopied, setIsCopied] = useState(false);

    const copy = useCallback(async (text) => {
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
