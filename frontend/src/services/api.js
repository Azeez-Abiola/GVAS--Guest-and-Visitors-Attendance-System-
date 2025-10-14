const API_BASE = 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Hosts
  async getHosts() {
    return this.request('/hosts');
  }

  // Visitors
  async getVisitors(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/visitors?${params}`);
  }

  async getVisitor(id) {
    return this.request(`/visitor/${id}`);
  }

  async preRegisterVisitor(data) {
    return this.request('/pre-register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkInVisitor(data) {
    return this.request('/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkOutVisitor(id) {
    return this.request(`/checkout/${id}`, {
      method: 'POST',
    });
  }

  async notifyHost(visitorId, message) {
    return this.request('/notify-host', {
      method: 'POST',
      body: JSON.stringify({ visitorId, message }),
    });
  }

  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();