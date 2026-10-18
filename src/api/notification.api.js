import apiClient from './client';

export const notificationApi = {
  /**
   * Register device token for FCM push notifications
   * @param {string} token - FCM registration token
   * @param {string} platform - 'android' | 'ios' | 'web'
   */
  async registerDeviceToken(token, platform = 'android') {
    const response = await apiClient.post('/notifications/device-token', { token, platform }, { silent: true });
    return response.data;
  },

  /**
   * Unregister device token
   * @param {string} token
   */
  async unregisterDeviceToken(token) {
    const response = await apiClient.delete('/notifications/device-token', { data: { token }, silent: true });
    return response.data;
  },

  /**
   * Trigger test push notification
   */
  async sendTestNotification() {
    const response = await apiClient.post('/notifications/test');
    return response.data;
  },

  /**
   * Get current unread notification count
   */
  async getUnreadCount() {
    const response = await apiClient.get('/notifications/unread-count', { silent: true });
    return response.data;
  },

  /**
   * Fetch user notifications list
   */
  async getNotifications(params = {}) {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  /**
   * Mark notification as read
   */
  async markRead(id) {
    const response = await apiClient.post(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllRead() {
    const response = await apiClient.post('/notifications/read-all');
    return response.data;
  },
};

export default notificationApi;

