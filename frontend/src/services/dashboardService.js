
import api from './api.js';

const dashboardService = {
    getOverview() {
        return api.get('/dashboard/overview');
    },

    getRecentActivity() {
        return api.get('/dashboard/activity');
    },
};

export default dashboardService;
