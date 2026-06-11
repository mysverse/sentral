import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { toApiError, toValidationApiError } from "lib/errors";

const testScoreSchema = z.object({
  eventId: z.string().min(1).max(100),
  playerName: z.string().min(1).max(50),
  lapTime: z.number().positive()
});

export async function POST(request: NextRequest) {
  // Test-data injection endpoint; never expose in production
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const body = await request.json();
    const { eventId, playerName, lapTime } = testScoreSchema.parse(body);

    // Call the actual leaderboard API
    const response = await fetch(
      `${request.nextUrl.origin}/api/leaderboard/${eventId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.LEADERBOARD_API_KEY ?? ""
        },
        body: JSON.stringify({
          playerName,
          lapTime,
          eventName: `Test Event ${eventId}`
        })
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add test data");
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: `Added ${playerName} with time ${lapTime}s`,
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(toValidationApiError(error.issues), {
        status: 400
      });
    }
    console.error("Error adding test data:", error);
    return NextResponse.json(toApiError(error), { status: 500 });
  }
}
