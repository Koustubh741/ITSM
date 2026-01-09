/**
 * API Client for Asset Management Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

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

        // Handle body serialization
        if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            
            // Handle empty responses
            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = text ? JSON.parse(text) : {};
            }

            if (!response.ok) {
                throw new Error(data.detail || data.message || `API request failed: ${response.status}`);
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

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData,
        });
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
            method: 'PATCH',
            body: JSON.stringify(assetData),
        });
    }

    async assignAsset(id, assignmentData) {
        return this.request(`/assets/${id}/assign`, {
            method: 'PATCH',
            body: JSON.stringify(assignmentData),
        });
    }

    async updateAssetStatus(id, status) {
        return this.request(`/assets/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    async getMyAssets(user) {
        return this.request(`/assets/my-assets?user=${encodeURIComponent(user)}`);
    }

    async getAssetEvents(id) {
        return this.request(`/assets/${id}/events`);
    }

    async deleteAsset(id) {
        return this.request(`/assets/${id}`, {
            method: 'DELETE',
        });
    }

    async getAssetStats() {
        return this.request('/assets/stats');
    }

    // Asset Requests
    async getAssetRequests(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/asset-requests?${queryString}`);
    }

    async getAssetRequest(id) {
        return this.request(`/asset-requests/${id}`);
    }

    async createAssetRequest(requestData) {
        return this.request('/asset-requests', {
            method: 'POST',
            body: JSON.stringify(requestData),
        });
    }

    async managerApproveRequest(id, approvalData) {
        return this.request(`/asset-requests/${id}/manager/approve`, {
            method: 'POST',
            body: JSON.stringify(approvalData || {}),
        });
    }

    async managerRejectRequest(id, rejectionData) {
        return this.request(`/asset-requests/${id}/manager/reject`, {
            method: 'POST',
            body: JSON.stringify(rejectionData),
        });
    }

    async itApproveRequest(id, approvalData) {
        return this.request(`/asset-requests/${id}/it/approve`, {
            method: 'POST',
            body: JSON.stringify(approvalData || {}),
        });
    }

    async itRejectRequest(id, rejectionData) {
        return this.request(`/asset-requests/${id}/it/reject`, {
            method: 'POST',
            body: JSON.stringify(rejectionData),
        });
    }

    async byodRegister(requestId, payload, reviewerId) {
        return this.request(`/asset-requests/${requestId}/byod/register?reviewer_id=${reviewerId}`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    async procurementApproveRequest(id, approvalData) {
        return this.request(`/asset-requests/${id}/procurement/approve`, {
            method: 'POST',
            body: JSON.stringify(approvalData || {}),
        });
    }

    async procurementRejectRequest(id, rejectionData) {
        return this.request(`/asset-requests/${id}/procurement/reject`, {
            method: 'POST',
            body: JSON.stringify(rejectionData),
        });
    }

    async procurementConfirmDelivery(id, reviewerId) {
        return this.request(`/asset-requests/${id}/procurement/confirm-delivery?reviewer_id=${reviewerId}`, {
            method: 'POST',
        });
    }

    async inventoryAllocateAsset(requestId, assetId, inventoryManagerId) {
        return this.request(`/asset-requests/${requestId}/inventory/allocate?asset_id=${assetId}&inventory_manager_id=${inventoryManagerId}`, {
            method: 'POST',
        });
    }

    async inventoryMarkNotAvailable(requestId, inventoryManagerId) {
        return this.request(`/asset-requests/${requestId}/inventory/not-available?inventory_manager_id=${inventoryManagerId}`, {
            method: 'POST',
        });
    }

    // Legacy compatibility methods
    async getRequests(params = {}) {
        return this.getAssetRequests(params);
    }

    async createRequest(requestData) {
        return this.createAssetRequest(requestData);
    }

    async approveRequest(id) {
        return this.managerApproveRequest(id);
    }

    async rejectRequest(id, reason) {
        return this.managerRejectRequest(id, { rejection_reason: reason });
    }

    // Tickets
    async getTickets(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/tickets?${queryString}`);
    }

    async getTicket(id) {
        return this.request(`/tickets/${id}`);
    }

    async createTicket(ticketData) {
        return this.request('/tickets', {
            method: 'POST',
            body: JSON.stringify(ticketData),
        });
    }

    async updateTicket(id, ticketData) {
        return this.request(`/tickets/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(ticketData),
        });
    }

    async diagnoseTicket(id, diagnosisData) {
        return this.request(`/tickets/${id}/it/diagnose`, {
            method: 'POST',
            body: JSON.stringify(diagnosisData),
        });
    }

    async acknowledgeTicket(id, reviewerId) {
        return this.request(`/tickets/${id}/acknowledge`, {
            method: 'POST',
            body: JSON.stringify({
                reviewer_id: reviewerId,
                outcome: 'acknowledge',
                notes: 'Ticket acknowledged by IT'
            }),
        });
    }

    async resolveTicket(id, reviewerId, notes, checklist = [], percentage = 100.0) {
        return this.request(`/tickets/${id}/resolve`, {
            method: 'POST',
            body: JSON.stringify({
                reviewer_id: reviewerId,
                notes: notes,
                checklist: checklist,
                percentage: percentage
            }),
        });
    }

    async updateTicketProgress(id, reviewerId, notes, checklist, percentage) {
        return this.request(`/tickets/${id}/progress`, {
            method: 'POST',
            body: JSON.stringify({
                reviewer_id: reviewerId,
                notes: notes,
                checklist: checklist,
                percentage: percentage
            }),
        });
    }

    // Users
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/auth/users?${queryString}`);
    }

    async activateUser(userId) {
        return this.request(`/auth/users/${userId}/activate`, {
            method: 'POST'
        });
    }

    async denyUser(userId) {
        return this.request(`/auth/users/${userId}/disable`, {
            method: 'POST'
        });
    }

    async getUser(id) {
        return this.request(`/auth/users/${id}`);
    }

    async createUser(userData) {
        return this.request('/users/', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    // Exits
    async getExitRequests(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/auth/exit-requests?${queryString}`);
    }

    async initiateExit(userId) {
        return this.request(`/auth/users/${userId}/exit`, {
            method: 'POST'
        });
    }

    async processExitAssets(exitRequestId) {
        return this.request(`/auth/exit-requests/${exitRequestId}/process-assets`, {
            method: 'POST'
        });
    }

    async processExitByod(exitRequestId) {
        return this.request(`/auth/exit-requests/${exitRequestId}/process-byod`, {
            method: 'POST'
        });
    }

    async completeExitRequest(exitRequestId) {
        return this.request(`/auth/exit-requests/${exitRequestId}/complete`, {
            method: 'POST'
        });
    }

    // Disposal
    async getDisposalQueue() {
        return this.request('/disposal/queue');
    }

    async initiateDisposal(assetId) {
        return this.request(`/disposal/${assetId}/initiate`, {
            method: 'POST'
        });
    }

    async validateDisposal(assetId) {
        return this.request(`/disposal/${assetId}/validate`, {
            method: 'POST'
        });
    }

    async recordWipe(assetId) {
        return this.request(`/disposal/${assetId}/wipe`, {
            method: 'POST'
        });
    }

    async finalizeDisposal(assetId) {
        return this.request(`/disposal/${assetId}/finalize`, {
            method: 'POST'
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
        return fetch(`${this.baseURL}/health`)
            .then(res => res.json());
    }

    async dbHealthCheck() {
        return fetch(`${this.baseURL}/health/db`)
            .then(res => res.json());
    }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
