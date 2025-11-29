import { useState, useEffect, useRef } from 'react';

/**
 * useClickAway hook
 * Detect clicks outside of element
 */
export function useClickAway(callback) {
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
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

/**
 * useEventListener hook
 * Add event listener with cleanup
 */
export function useEventListener(eventName, handler, element = window) {
    const savedHandler = useRef();

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const isSupported = element && element.addEventListener;
        if (!isSupported) return;

        const eventListener = (event) => savedHandler.current(event);
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
export function useScript(src) {
    const [status, setStatus] = useState(src ? 'loading' : 'idle');

    useEffect(() => {
        if (!src) {
            setStatus('idle');
            return;
        }

        let script = document.querySelector(`script[src="${src}"]`);

        if (!script) {
            script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.setAttribute('data-status', 'loading');
            document.body.appendChild(script);

            const setAttributeFromEvent = (event) => {
                script.setAttribute(
                    'data-status',
                    event.type === 'load' ? 'ready' : 'error'
                );
            };

            script.addEventListener('load', setAttributeFromEvent);
            script.addEventListener('error', setAttributeFromEvent);
        } else {
            setStatus(script.getAttribute('data-status'));
        }

        const setStateFromEvent = (event) => {
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
export function useIdle(timeout = 60000) {
    const [isIdle, setIsIdle] = useState(false);

    useEffect(() => {
        let timeoutId;

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
export function useNetworkStatus() {
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
export function useBattery() {
    const [battery, setBattery] = useState({
        supported: false,
        loading: true,
        level: null,
        charging: null,
        chargingTime: null,
        dischargingTime: null
    });

    useEffect(() => {
        if (!navigator.getBattery) {
            setBattery(state => ({
                ...state,
                supported: false,
                loading: false
            }));
            return;
        }

        navigator.getBattery().then(battery => {
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
