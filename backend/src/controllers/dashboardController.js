
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export async function getDashboardOverview(req, res, next) {
    try {
        if (!req.user?.id) {
            return sendError(res, 'Authentication required.', 401);
        }

        const user = await User.findById(req.user.id)
            .select('createdAt lastLoginAt');

        if (!user) {
            return sendError(res, 'User not found.', 404);
        }

        // Placeholder metrics until project and task modules are implemented.
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
        if (!req.user?.id) {
            return sendError(res, 'Authentication required.', 401);
        }

        const user = await User.findById(req.user.id)
            .select('createdAt lastLoginAt');

        if (!user) {
            return sendError(res, 'User not found.', 404);
        }

        const activities = [];

        if (user.lastLoginAt) {
            activities.push({
                title: 'Signed in',
                description: 'You signed in to your Nexora account.',
                time: user.lastLoginAt,
            });
        }

        if (user.createdAt) {
            activities.push({
                title: 'Welcome to Nexora',
                description: 'Your account is ready to use.',
                time: user.createdAt,
            });
        }

        activities.sort(
            (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );

        return sendSuccess(res, 'Recent activity loaded.', {
            activities,
        });
    } catch (error) {
        return next(error);
    }
}
