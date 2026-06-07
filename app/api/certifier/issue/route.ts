import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "lib/prisma"; // Added for ApiKey check

import {
  certificateSchema,
  generateGenericCertificate
} from "../../../(main)/dashboard/certifier/utils"; // Corrected import path
import { toApiError } from "lib/errors";

export async function POST(request: Request) {
  try {
    const apiKeyHeader = request.headers.get("X-API-KEY");
    if (!apiKeyHeader) {
      return NextResponse.json({ error: "API Key missing" }, { status: 401 });
    }

    const json = await request.json();
    // Early parse for courseId to check API key against it
    const preliminaryParse = z.object({ courseId: z.string() }).safeParse(json);

    if (!preliminaryParse.success || !preliminaryParse.data.courseId) {
      return NextResponse.json(
        { error: "Invalid request body, missing or invalid courseId" },
        { status: 400 }
      );
    }

    const courseId = preliminaryParse.data.courseId;

    // Check API Key against the database
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: apiKeyHeader, courseId: courseId, isActive: true }
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: "Unauthorized or Invalid API Key for the course" },
        { status: 401 }
      );
    }

    const parsedSchema = certificateSchema.safeParse(json);

    if (!parsedSchema.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsedSchema.error },
        { status: 400 }
      );
    }

    const code = await generateGenericCertificate(parsedSchema.data);

    return NextResponse.json({ code });
  } catch (error) {
    console.error("Error generating certificate:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(toApiError(error), { status: 500 });
  }
}
