/**
 * API Client for Asset Management Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = null;

        // Load token from localStorage if available
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('accessToken');
        }
    }

    setToken(token) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token);
        }
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication
    async login(email, password) {
        const formData = new URLSearchParams();
        formData.append('username', email); // OAuth2 uses 'username' field
        formData.append('password', password);

        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }

        this.setToken(data.access_token);
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    }

    async logout() {
        await this.request('/auth/logout', { method: 'POST' });
        this.clearToken();
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Assets
    async getAssets(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/assets/?${queryString}`);
    }

    async getAsset(id) {
        return this.request(`/assets/${id}`);
    }

    async createAsset(assetData) {
        return this.request('/assets/', {
            method: 'POST',
            body: JSON.stringify(assetData),
        });
    }

    async updateAsset(id, assetData) {
        return this.request(`/assets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(assetData),
        });
    }

    async deleteAsset(id) {
        return this.request(`/assets/${id}`, {
            method: 'DELETE',
        });
    }

    async getAssetStats() {
        return this.request('/assets/stats/summary');
    }

    // Requests
    async getRequests(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/requests/?${queryString}`);
    }

    async createRequest(requestData) {
        return this.request('/requests/', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });
    }

    async approveRequest(id) {
        return this.request(`/requests/${id}/approve`, {
            method: 'PUT',
        });
    }

    async rejectRequest(id, reason) {
        return this.request(`/requests/${id}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ reason }),
        });
    }

    // Dashboard
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }

    async getAssetsByLocation() {
        return this.request('/dashboard/assets-by-location');
    }

    async getRecentAssets(limit = 10) {
        return this.request(`/dashboard/recent-assets?limit=${limit}`);
    }

    // Users
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/users/?${queryString}`);
    }

    async getUser(id) {
        return this.request(`/users/${id}`);
    }

    async createUser(userData) {
        return this.request('/users/', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    // Departments
    async getDepartments() {
        return this.request('/departments/');
    }

    // Locations
    async getLocations() {
        return this.request('/locations/');
    }

    // Health Check
    async healthCheck() {
        return fetch(`${this.baseURL.replace('/api', '')}/health`)
            .then(res => res.json());
    }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
