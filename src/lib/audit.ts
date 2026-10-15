import prisma from './prisma';

interface LogAuditParams {
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'STATUS_CHANGE' | 'EXPORT' | 'ADJUST_STOCK' | 'REFUND';
  entity: 'PRODUCT' | 'ORDER' | 'INVENTORY' | 'USER' | 'SETTINGS' | 'COUPON' | 'CATEGORY' | 'BRAND' | 'ARTICLE';
  entityId?: string | null;
  details?: Record<string, any> | string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAuditAction(params: LogAuditParams) {
  try {
    const detailsString = typeof params.details === 'object'
      ? JSON.stringify(params.details)
      : params.details || null;

    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        userEmail: params.userEmail || null,
        userRole: params.userRole || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: detailsString,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

