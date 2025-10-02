/**
 * In-flight request deduplication and cancellation utilities
 * Prevents duplicate concurrent requests and allows aborting stale requests
 */

// Map to store in-flight requests by key
const inflightRequests = new Map<string, Promise<any>>();

// Map to store abort controllers for cancellable requests
const abortControllers = new Map<string, AbortController>();

/**
 * Generate a unique key for a request based on URL and params
 */
function generateRequestKey(url: string, params?: RequestInit): string {
    const method = params?.method || 'GET';
    const body = params?.body ? JSON.stringify(params.body) : '';
    return `${method}:${url}:${body}`;
}

/**
 * Deduplicated fetch - coalesces identical concurrent requests
 * If the same request is already in-flight, returns the existing promise
 */
export async function deduplicatedFetch<T = any>(
    url: string,
    params?: RequestInit
): Promise<T> {
    const key = generateRequestKey(url, params);

    // Return existing promise if in-flight
    if (inflightRequests.has(key)) {
        return inflightRequests.get(key)!;
    }

    // Create new request
    const promise = fetch(url, params)
        .then(async (res) => {
            if (!res.ok) {
                throw new Error(await res.text());
            }
            return res.json();
        })
        .finally(() => {
            // Remove from in-flight map when settled
            inflightRequests.delete(key);
        });

    inflightRequests.set(key, promise);
    return promise;
}

/**
 * Cancellable fetch - allows aborting requests when filters change
 * Automatically cancels previous request with same tag
 */
export async function cancellableFetch<T = any>(
    url: string,
    params?: RequestInit,
    tag?: string
): Promise<T> {
    const requestTag = tag || generateRequestKey(url, params);

    // Cancel previous request with same tag
    if (abortControllers.has(requestTag)) {
        abortControllers.get(requestTag)!.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllers.set(requestTag, controller);

    try {
        const response = await fetch(url, {
            ...params,
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return await response.json();
    } finally {
        // Clean up controller
        if (abortControllers.get(requestTag) === controller) {
            abortControllers.delete(requestTag);
        }
    }
}

/**
 * Cancel all in-flight requests with a specific tag
 */
export function cancelRequest(tag: string): void {
    const controller = abortControllers.get(tag);
    if (controller) {
        controller.abort();
        abortControllers.delete(tag);
    }
}
