
const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: options.method || 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const contentType = response.headers.get('content-type') || '';

    const data = contentType.includes('application/json')
        ? await response.json()
        : null;

    if (!response.ok) {
        throw new Error(
            data?.message || `Request failed with status ${response.status}`
        );
    }

    return data;
}

const api = {
    get(endpoint) {
        return apiRequest(endpoint);
    },

    post(endpoint, body) {
        return apiRequest(endpoint, {
            method: 'POST',
            body,
        });
    },

    put(endpoint, body) {
        return apiRequest(endpoint, {
            method: 'PUT',
            body,
        });
    },

    patch(endpoint, body) {
        return apiRequest(endpoint, {
            method: 'PATCH',
            body,
        });
    },

    delete(endpoint) {
        return apiRequest(endpoint, {
            method: 'DELETE',
        });
    },
};

export default api;
