
import api from './api.js';

const authService = {
    register(userData) {
        return api.post('/auth/register', userData);
    },

    verifyEmail(email, otp) {
        return api.post('/auth/verify-email', {
            email,
            otp,
        });
    },

    resendOtp(email) {
        return api.post('/auth/resend-otp', {
            email,
        });
    },

    login(credentials) {
        return api.post('/auth/login', credentials);
    },

    logout() {
        return api.post('/auth/logout');
    },

    getCurrentUser() {
        return api.get('/auth/me');
    },

    updateProfile(profileData) {
        return api.patch('/auth/profile', profileData);
    },

    forgotPassword(email) {
        return api.post('/auth/forgot-password', {
            email,
        });
    },

    resetPassword(email, otp, newPassword) {
        return api.post('/auth/reset-password', {
            email,
            otp,
            newPassword,
        });
    },
};

export default authService;
