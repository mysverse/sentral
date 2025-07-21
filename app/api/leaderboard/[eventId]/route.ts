import { NextRequest, NextResponse } from "next/server";
import prisma from "lib/prisma";
import { z } from "zod";
import { broadcastLeaderboardUpdate } from "../../../../lib/sse-connections";

const addScoreSchema = z.object({
  playerName: z.string().min(1).max(50),
  lapTime: z.number().positive(),
  eventName: z.string().min(1).max(100).optional()
});

// API Key validation function
function validateApiKey(request: NextRequest): boolean {
  const apiKey =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  const validApiKey = process.env.LEADERBOARD_API_KEY;

  if (!validApiKey) {
    console.warn("LEADERBOARD_API_KEY not set - API is unsecured!");
    return true; // Allow if no key is set (development mode)
  }

  return apiKey === validApiKey;
}

// GET - Fetch leaderboard for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    const leaderboard = await prisma.leaderboard.findMany({
      where: { eventId },
      orderBy: { lapTime: "asc" },
      take: 50 // Limit to top 50 players
    });

    // Calculate positions
    const leaderboardWithPositions = leaderboard.map(
      (entry: any, index: number) => ({
        ...entry,
        position: index + 1
      })
    );

    return NextResponse.json(leaderboardWithPositions);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

// POST - Add or update a player's score
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    // Validate API key for POST requests
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: "Unauthorized. Valid API key required." },
        { status: 401 }
      );
    }

    const { eventId } = await params;
    const body = await request.json();

    const { playerName, lapTime, eventName } = addScoreSchema.parse(body);

    // Check if player already exists for this event
    const existingEntry = await prisma.leaderboard.findUnique({
      where: {
        unique_player_per_event: {
          eventId,
          playerName
        }
      }
    });

    let result;
    let isNewRecord = false;
    let isPersonalBest = false;

    if (existingEntry) {
      // Update only if new time is better (lower)
      if (lapTime < existingEntry.lapTime) {
        result = await prisma.leaderboard.update({
          where: { id: existingEntry.id },
          data: { lapTime, updatedAt: new Date() }
        });
        isPersonalBest = true;
      } else {
        // Return existing record if new time isn't better
        result = existingEntry;
      }
    } else {
      // Create new entry
      result = await prisma.leaderboard.create({
        data: {
          eventId,
          eventName: eventName || `Event ${eventId}`,
          playerName,
          lapTime
        }
      });
      isNewRecord = true;
    }

    // Get current position
    const betterTimes = await prisma.leaderboard.count({
      where: {
        eventId,
        lapTime: { lt: result.lapTime }
      }
    });

    const position = betterTimes + 1;

    // Update position in the record
    await prisma.leaderboard.update({
      where: { id: result.id },
      data: { position }
    });

    // Broadcast update to SSE connections
    broadcastLeaderboardUpdate(eventId);

    return NextResponse.json({
      ...result,
      position,
      isNewRecord,
      isPersonalBest
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error adding score:", error);
    return NextResponse.json({ error: "Failed to add score" }, { status: 500 });
  }
}
