export function throttle<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
): T {
    let timer: number | null = null;
    return ((...args: Parameters<T>) => {
        if (timer !== null) {
            return;
        }

        timer = setTimeout(() => {
            fn(...args);
            timer = null;
        }, delay);
    }) as T;
}

