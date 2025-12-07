import { useState, useEffect, useRef } from 'react';

/**
 * useClickAway hook
 * Detect clicks outside of element
 */
export function useClickAway<T extends HTMLElement = HTMLElement>(callback: (event: MouseEvent | TouchEvent) => void): React.RefObject<T | null> {
    const ref = useRef<T>(null);

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
export function useEventListener(eventName: string, handler: (event: Event) => void, element: EventTarget | null = typeof window !== 'undefined' ? window : null): void {
    const savedHandler = useRef<(event: Event) => void | undefined>(undefined);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const isSupported = element && element.addEventListener;
        if (!isSupported) return;

        const eventListener = (event: Event) => {
            if (savedHandler.current) {
                savedHandler.current(event);
            }
        };
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
export function useScript(src: string): string {
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
export function useIdle(timeout = 60000): boolean {
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
export function useNetworkStatus(): boolean {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEventListener('online', () => setIsOnline(true));
    useEventListener('offline', () => setIsOnline(false));

    return isOnline;
}

interface BatteryManager extends EventTarget {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
}

interface NavigatorWithBattery extends Navigator {
    getBattery: () => Promise<BatteryManager>;
}

interface BatteryState {
    supported: boolean;
    loading: boolean;
    level: number | null;
    charging: boolean | null;
    chargingTime: number | null;
    dischargingTime: number | null;
}

/**
 * useBattery hook
 * Get battery status
 */
export function useBattery(): BatteryState {
    const [battery, setBattery] = useState<BatteryState>({
        supported: false,
        loading: true,
        level: null,
        charging: null,
        chargingTime: null,
        dischargingTime: null
    });

    useEffect(() => {
        const nav = navigator as unknown as NavigatorWithBattery;
        if (!nav.getBattery) {
            setBattery(state => ({
                ...state,
                supported: false,
                loading: false
            }));
            return;
        }

        nav.getBattery().then((batteryManager: BatteryManager) => {
            const updateBattery = () => {
                setBattery({
                    supported: true,
                    loading: false,
                    level: batteryManager.level,
                    charging: batteryManager.charging,
                    chargingTime: batteryManager.chargingTime,
                    dischargingTime: batteryManager.dischargingTime
                });
            };

            updateBattery();

            batteryManager.addEventListener('levelchange', updateBattery);
            batteryManager.addEventListener('chargingchange', updateBattery);
            batteryManager.addEventListener('chargingtimechange', updateBattery);
            batteryManager.addEventListener('dischargingtimechange', updateBattery);

            return () => {
                batteryManager.removeEventListener('levelchange', updateBattery);
                batteryManager.removeEventListener('chargingchange', updateBattery);
                batteryManager.removeEventListener('chargingtimechange', updateBattery);
                batteryManager.removeEventListener('dischargingtimechange', updateBattery);
            };
        });
    }, []);

    return battery;
}
