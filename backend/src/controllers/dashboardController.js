
import { sendSuccess } from '../utils/apiResponse.js';
import User from '../models/User.js';

export async function getDashboardOverview(req, res, next) {
    try {
        const user = await User.findById(req.user.id).select('createdAt lastLoginAt');

        if (!user) {
            return sendSuccess(res, 'Dashboard overview loaded.', {
                totalProjects: 0,
                tasksCompleted: 0,
                productivity: 0,
            });
        }

        // Project and task models are not implemented yet.
        // These values are placeholders until those modules are added.
        return sendSuccess(res, 'Dashboard overview loaded.', {
            totalProjects: 0,
            tasksCompleted: 0,
            productivity: 0,
            accountCreatedAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getRecentActivity(req, res, next) {
    try {
        const user = await User.findById(req.user.id).select('createdAt lastLoginAt');

        if (!user) {
            return sendSuccess(res, 'Recent activity loaded.', {
                activities: [],
            });
        }

        const activities = [
            {
                title: 'Welcome to Nexora',
                description: 'Your account is ready to use.',
                time: user.createdAt,
            },
        ];

        if (user.lastLoginAt) {
            activities.unshift({
                title: 'Signed in',
                description: 'You signed in to your Nexora account.',
                time: user.lastLoginAt,
            });
        }

        return sendSuccess(res, 'Recent activity loaded.', { activities });
    } catch (error) {
        return next(error);
    }
}
