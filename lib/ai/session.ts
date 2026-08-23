type SessionData = {
  lastProductId?: string;
  createdAt: number;
};

const sessions = new Map<string, SessionData>();

export function getSession(sessionId: string) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { createdAt: Date.now() });
  }
  return sessions.get(sessionId)!;
}

export function setLastProduct(sessionId: string, productId: string) {
  const s = getSession(sessionId);
  s.lastProductId = productId;
}

export function clearSession(sessionId: string) {
  sessions.delete(sessionId);
}

export function listSessions() {
  return Array.from(sessions.entries()).map(([id, data]) => ({ id, ...data }));
}
