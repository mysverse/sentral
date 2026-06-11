export interface SSEWriter {
  write: (data: string) => void;
  close: () => void;
}

// Global map to store active SSE connections per event
const connections = new Map<string, Set<SSEWriter>>();

export const MAX_CONNECTIONS_PER_EVENT = 100;

export function isEventFull(eventId: string): boolean {
  return getConnectionCount(eventId) >= MAX_CONNECTIONS_PER_EVENT;
}

export function addConnection(eventId: string, writer: SSEWriter) {
  if (!connections.has(eventId)) {
    connections.set(eventId, new Set());
  }
  connections.get(eventId)!.add(writer);
}

export function removeConnection(eventId: string, writer: SSEWriter) {
  const eventConnections = connections.get(eventId);
  if (eventConnections) {
    eventConnections.delete(writer);
    if (eventConnections.size === 0) {
      connections.delete(eventId);
    }
  }
}

export function broadcastToConnections(eventId: string, message: string) {
  const eventConnections = connections.get(eventId);
  if (eventConnections && eventConnections.size > 0) {
    eventConnections.forEach((writer) => {
      try {
        writer.write(message);
      } catch (error) {
        console.error("Error writing to SSE connection:", error);
        // Remove invalid connections
        eventConnections.delete(writer);
      }
    });
  }
}

export function getConnectionCount(eventId: string): number {
  return connections.get(eventId)?.size || 0;
}

const BROADCAST_DEBOUNCE_MS = 500;
const pendingBroadcasts = new Map<string, NodeJS.Timeout>();

// Coalesce bursts of score submissions into a single DB query + broadcast:
// the first submission schedules a broadcast, further ones within the window
// piggyback on it. Worst-case latency for listeners is BROADCAST_DEBOUNCE_MS.
export function broadcastLeaderboardUpdate(eventId: string) {
  if (getConnectionCount(eventId) === 0 || pendingBroadcasts.has(eventId)) {
    return;
  }
  const timeout = setTimeout(() => {
    pendingBroadcasts.delete(eventId);
    void doBroadcast(eventId);
  }, BROADCAST_DEBOUNCE_MS);
  pendingBroadcasts.set(eventId, timeout);
}

async function doBroadcast(eventId: string) {
  const { default: prisma } = await import("./prisma");

  try {
    const leaderboard = await prisma.leaderboard.findMany({
      where: { eventId },
      orderBy: { lapTime: "asc" },
      take: 50
    });

    const leaderboardWithPositions = leaderboard.map(
      (entry: any, index: number) => ({
        ...entry,
        position: index + 1
      })
    );

    const message = `data: ${JSON.stringify({
      type: "leaderboard_update",
      data: leaderboardWithPositions
    })}\n\n`;

    broadcastToConnections(eventId, message);
  } catch (error) {
    console.error("Error broadcasting leaderboard update:", error);
  }
}
