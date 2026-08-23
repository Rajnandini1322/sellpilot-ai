/**
 * lib/audit
 * Simple audit trail helper that records safe, structured audit events.
 * Real persistence will be added in later milestones (Prisma -> AuditLog table).
 */

export type AuditEvent = {
  actor?: string;
  merchantId: string;
  action: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

export function recordEvent(event: AuditEvent) {
  // For now, write to console in a structured way. This ensures every action
  // is recorded at least to local logs during development.
  // In later milestones this will be written to a persistent AuditLog.
  // Do NOT perform any money action here.
  console.info("AUDIT_EVENT", JSON.stringify({ ...event, createdAt: new Date().toISOString() }));
}
