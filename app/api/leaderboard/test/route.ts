import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { eventId, playerName, lapTime } = await request.json();

    // Call the actual leaderboard API
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:4300"}/api/leaderboard/${eventId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.LEADERBOARD_API_KEY || "development-key"
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
    console.error("Error adding test data:", error);
    return NextResponse.json(
      { error: "Failed to add test data" },
      { status: 500 }
    );
  }
}
