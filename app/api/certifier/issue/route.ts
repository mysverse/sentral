import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "lib/prisma"; // Added for ApiKey check

import {
  certificateSchema,
  generateGenericCertificate
} from "../../../(main)/dashboard/certifier/utils"; // Corrected import path
import { AppError, toApiError, toValidationApiError } from "lib/errors";
import { certIssueLimiter, enforceRateLimit } from "lib/ratelimit";

export async function POST(request: Request) {
  try {
    const apiKeyHeader = request.headers.get("X-API-KEY");
    if (!apiKeyHeader) {
      return NextResponse.json(
        toApiError(new AppError("API key missing", { kind: "auth" })),
        { status: 401 }
      );
    }

    const json = await request.json();
    // Early parse for courseId to check API key against it
    const preliminaryParse = z.object({ courseId: z.string() }).safeParse(json);

    if (!preliminaryParse.success || !preliminaryParse.data.courseId) {
      return NextResponse.json(
        toValidationApiError(preliminaryParse.error?.issues ?? []),
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
        toApiError(
          new AppError("Invalid API key for the course", { kind: "auth" })
        ),
        { status: 401 }
      );
    }

    const limited = await enforceRateLimit(certIssueLimiter, apiKey.id);
    if (limited) {
      return limited;
    }

    const parsedSchema = certificateSchema.safeParse(json);

    if (!parsedSchema.success) {
      return NextResponse.json(toValidationApiError(parsedSchema.error.issues), {
        status: 400
      });
    }

    const code = await generateGenericCertificate(parsedSchema.data);

    return NextResponse.json({ code });
  } catch (error) {
    console.error("Error generating certificate:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(toValidationApiError(error.issues), {
        status: 400
      });
    }
    return NextResponse.json(toApiError(error), { status: 500 });
  }
}
