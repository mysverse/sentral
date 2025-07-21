// Global map to store active SSE connections per event
const connections = new Map<string, Set<any>>();

export function addConnection(eventId: string, writer: any) {
  if (!connections.has(eventId)) {
    connections.set(eventId, new Set());
  }
  connections.get(eventId)!.add(writer);
}

export function removeConnection(eventId: string, writer: any) {
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

// Function to broadcast leaderboard updates to all connections for an event
export async function broadcastLeaderboardUpdate(eventId: string) {
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
