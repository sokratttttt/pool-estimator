import { useState, useEffect, useRef } from 'react';

/**
 * useClickAway hook
 * Detect clicks outside of element
 */
export function useClickAway(callback: (event: MouseEvent | TouchEvent) => void): any {
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent | TouchEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback(event);
            }
        };

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('touchstart', handleClick);

        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('touchstart', handleClick);
        };
    }, [callback]);

    return ref;
}

export const useOnClickOutside = useClickAway;

/**
 * useEventListener hook
 * Add event listener with cleanup
 */
export function useEventListener(eventName: string, handler: (event: Event) => void, element: any = window): any {
    const savedHandler = useRef<any>(null);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const isSupported = element && element.addEventListener;
        if (!isSupported) return;

        const eventListener = (event: Event) => savedHandler.current(event);
        element.addEventListener(eventName, eventListener);

        return () => {
            element.removeEventListener(eventName, eventListener);
        };
    }, [eventName, element]);
}

/**
 * useScript hook
 * Dynamically load external script
 */
export function useScript(src: string): any {
    const [status, setStatus] = useState(src ? 'loading' : 'idle');

    useEffect(() => {
        if (!src) {
            setStatus('idle');
            return;
        }

        let script: HTMLScriptElement | null = document.querySelector(`script[src="${src}"]`);

        if (!script) {
            script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.setAttribute('data-status', 'loading');
            document.body.appendChild(script);

            const setAttributeFromEvent = (event: Event) => {
                script?.setAttribute(
                    'data-status',
                    event.type === 'load' ? 'ready' : 'error'
                );
            };

            script.addEventListener('load', setAttributeFromEvent);
            script.addEventListener('error', setAttributeFromEvent);
        } else {
            setStatus(script.getAttribute('data-status') || 'idle');
        }

        const setStateFromEvent = (event: Event) => {
            setStatus(event.type === 'load' ? 'ready' : 'error');
        };

        script.addEventListener('load', setStateFromEvent);
        script.addEventListener('error', setStateFromEvent);

        return () => {
            if (script) {
                script.removeEventListener('load', setStateFromEvent);
                script.removeEventListener('error', setStateFromEvent);
            }
        };
    }, [src]);

    return status;
}

/**
 * useIdle hook
 * Detect user inactivity
 */
export function useIdle(timeout = 60000): any {
    const [isIdle, setIsIdle] = useState(false);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const handleActivity = () => {
            setIsIdle(false);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => setIsIdle(true), timeout);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        events.forEach(event => {
            document.addEventListener(event, handleActivity);
        });

        timeoutId = setTimeout(() => setIsIdle(true), timeout);

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
            clearTimeout(timeoutId);
        };
    }, [timeout]);

    return isIdle;
}

/**
 * useNetworkStatus hook
 * Monitor online/offline status
 */
export function useNetworkStatus(): any {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEventListener('online', () => setIsOnline(true));
    useEventListener('offline', () => setIsOnline(false));

    return isOnline;
}

/**
 * useBattery hook
 * Get battery status
 */
export function useBattery(): any {
    const [battery, setBattery] = useState<any>({
        supported: false,
        loading: true,
        level: null,
        charging: null,
        chargingTime: null,
        dischargingTime: null
    });

    useEffect(() => {
        if (!(navigator as any).getBattery) {
            setBattery((state: any) => ({
                ...state,
                supported: false,
                loading: false
            }));
            return;
        }

        (navigator as any).getBattery().then((battery: any) => {
            const updateBattery = () => {
                setBattery({
                    supported: true,
                    loading: false,
                    level: battery.level,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                });
            };

            updateBattery();

            battery.addEventListener('levelchange', updateBattery);
            battery.addEventListener('chargingchange', updateBattery);
            battery.addEventListener('chargingtimechange', updateBattery);
            battery.addEventListener('dischargingtimechange', updateBattery);

            return () => {
                battery.removeEventListener('levelchange', updateBattery);
                battery.removeEventListener('chargingchange', updateBattery);
                battery.removeEventListener('chargingtimechange', updateBattery);
                battery.removeEventListener('dischargingtimechange', updateBattery);
            };
        });
    }, []);

    return battery;
}
