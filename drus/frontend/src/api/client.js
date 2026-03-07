export default async function client(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            const errorText = await response.text();

            // Auto logout if token is expired or invalid
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        // Some endpoints might return empty responses
        if (response.status === 204) return null;

        return await response.json();
    } catch (err) {
        console.error(`Client request failed for ${url}:`, err);
        throw err;
    }
}
