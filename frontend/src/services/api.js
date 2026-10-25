
const API_BASE_URL = (
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '');

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = {
        ...options.headers,
    };

    if (options.body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    let response;

    try {
        response = await fetch(url, {
            method: options.method || 'GET',
            credentials: 'include',
            headers,
            body:
                options.body !== undefined
                    ? JSON.stringify(options.body)
                    : undefined,
        });
    } catch {
        throw new Error(
            'Unable to connect to the server. Please check your connection and try again.'
        );
    }

    const contentType = response.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
        try {
            data = await response.json();
        } catch {
            throw new Error('The server returned an invalid response.');
        }
    }

    if (!response.ok) {
        throw new Error(
            data?.message || `Request failed with status ${response.status}.`
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
