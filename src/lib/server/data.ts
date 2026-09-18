import "server-only";
import { db } from "./db";
import { currentUser } from "./auth";
import { ApiError } from "./security";
import { hasEntitlement } from "./subscriptions";

export const publicUserSelect = { id: true, name: true, email: true, image: true, role: true, emailVerified: true, createdAt: true } as const;
const subscriptionSelect = { id: true, userId: true, planId: true, status: true, billingCycle: true,
  unitAmount: true, currency: true, provider: true, providerSubscriptionId: true,
  currentPeriodStart: true, currentPeriodEnd: true, trialStart: true, trialEnd: true, trialUsed: true,
  cancelAtPeriodEnd: true, cancelledAt: true, endedAt: true, createdAt: true, updatedAt: true, plan: true } as const;
export async function getPublicPlans() {
  return db.plan.findMany({ where: { active: true }, orderBy: { monthlyPrice: "asc" }, take: 50 });
}
export async function getMemberData(userId: string) {
  const viewer = await currentUser();
  if (!viewer) throw new ApiError("unauthorized", 401);
  if (viewer.id !== userId) throw new ApiError("forbidden", 403);
  const [user, storedSubscription, transactions, tickets, notifications, activities, storedUsage, transactionCount, ticketCount, unreadNotifications] = await db.$transaction([
    db.user.findUniqueOrThrow({ where: { id: userId }, select: publicUserSelect }),
    db.subscription.findUnique({ where: { userId }, select: subscriptionSelect }),
    db.transaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.ticket.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.activity.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 30 }),
    db.usage.findUnique({ where: { userId } }),
    db.transaction.count({ where: { userId } }), db.ticket.count({ where: { userId } }),
    db.notification.count({ where: { userId, readAt: null } }),
  ]);
  const entitled = hasEntitlement(storedSubscription);
  const subscription = storedSubscription && {
    ...storedSubscription,
    status: ["active", "trial"].includes(storedSubscription.status) && !entitled ? "expired" : storedSubscription.status,
  };
  const usage = { toolsUsed: storedUsage?.toolsUsed ?? 0, toolsLimit: entitled ? storedUsage?.toolsLimit ?? 10 : 10,
    storageUsed: storedUsage?.storageUsed ?? 0, storageLimit: entitled ? storedUsage?.storageLimit ?? 100 : 100 };
  return { user, subscription, transactions, tickets, notifications, activities, usage, summary: { transactionCount, ticketCount, unreadNotifications } };
}
export async function getAdminData() {
  const viewer = await currentUser();
  if (!viewer) throw new ApiError("unauthorized", 401);
  if (viewer.role !== "admin") throw new ApiError("forbidden", 403);
  const activeWhere = { status: { in: ["active", "trial"] }, currentPeriodEnd: { gt: new Date() } };
  const [users, subscriptions, plans, transactions, coupons, tickets, activities, totalUsers, totalSubscriptions, activeSubscriptions, paid, recurring, totalTransactions, totalTickets, totalCoupons, settings] = await db.$transaction([
    db.user.findMany({ select: { ...publicUserSelect, subscription: { include: { plan: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.subscription.findMany({ include: { user: { select: publicUserSelect }, plan: true }, orderBy: { updatedAt: "desc" }, take: 100 }),
    db.plan.findMany({ orderBy: { monthlyPrice: "asc" }, take: 100 }),
    db.transaction.findMany({ include: { user: { select: publicUserSelect } }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.coupon.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.ticket.findMany({ include: { user: { select: publicUserSelect } }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.activity.findMany({ include: { user: { select: publicUserSelect } }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.user.count(), db.subscription.count(), db.subscription.count({ where: activeWhere }),
    db.transaction.aggregate({ where: { status: "paid", currency: "BDT" }, _sum: { amount: true } }),
    db.subscription.groupBy({ by: ["billingCycle"], orderBy: { billingCycle: "asc" }, where: { ...activeWhere, status: "active", currency: "BDT" }, _sum: { unitAmount: true } }),
    db.transaction.count(), db.ticket.count(), db.coupon.count(), db.setting.findMany({ take: 2 }),
  ]);
  return { users, subscriptions, plans, transactions, coupons, tickets, activities, settings,
    summary: { totalUsers, totalSubscriptions, activeSubscriptions, totalRevenue: paid._sum.amount ?? 0,
      monthlyRecurringRevenue: Math.round(recurring.reduce((sum, row) => sum + (row._sum?.unitAmount ?? 0) / (row.billingCycle === "yearly" ? 12 : 1), 0)),
      totalTransactions, totalTickets, totalCoupons, currency: "BDT", listLimit: 100 },
  };
}
