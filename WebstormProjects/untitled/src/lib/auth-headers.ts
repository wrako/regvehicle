// Helper to get auth headers with JWT token for client-side fetches
export function getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers: HeadersInit = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

// Helper to merge auth headers with other headers
export function withAuth(headers: HeadersInit = {}): HeadersInit {
    return { ...headers, ...getAuthHeaders() };
}
