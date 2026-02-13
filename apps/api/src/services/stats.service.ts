import { userService } from './user.service';
import { roleService } from './role.service';
import { prisma } from '../utils/prisma';
import type { Stats, Activity } from '@starter/shared';

export class StatsService {
  async getStats(): Promise<Stats> {
    const [usersCount, rolesCount, activeUsersCount] = await Promise.all([
      userService.count(),
      roleService.count(),
      userService.countActive(),
    ]);

    // Generate dummy recent activities
    const recentActivities = await this.generateRecentActivities();

    return {
      usersCount,
      rolesCount,
      activeUsersCount,
      recentActivities,
    };
  }

  private async generateRecentActivities(): Promise<Activity[]> {
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    const activities: Activity[] = recentUsers.map((user, index) => ({
      id: `activity-${index}`,
      action: 'User Created',
      user: user.name,
      timestamp: user.createdAt.toISOString(),
      details: 'New user registered',
    }));

    // Add some dummy activities
    activities.push({
      id: 'activity-login',
      action: 'Admin Login',
      user: 'System',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      details: 'Administrator logged in',
    });

    return activities;
  }
}

export const statsService = new StatsService();
