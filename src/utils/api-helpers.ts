import { NextResponse } from "next/server";
import { z } from "zod";

// ─── Success Response Envelope ───────────────────────────────────────────────

export function successResponse<T>(
  data: T,
  meta?: Record<string, any>,
  status = 200
) {
  return NextResponse.json(
    {
      data,
      ...(meta && { meta })
    },
    { status }
  );
}

// ─── Error Response Envelope ──────────────────────────────────────────────────

export function errorResponse(
  code: string,
  message: string,
  details: any = null,
  status = 400
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && { details })
      }
    },
    { status }
  );
}

// ─── Request Body Validation Helper ──────────────────────────────────────────

export async function validateBody<T>(
  schema: z.ZodSchema<T>,
  req: Request
): Promise<{ data?: T; errorResponse?: NextResponse }> {
  try {
    const json = await req.json();
    const parsed = schema.safeParse(json);

    if (!parsed.success) {
      const details = parsed.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message
      }));

      return {
        errorResponse: errorResponse(
          "VALIDATION_ERROR",
          "Invalid input payload parameters.",
          details,
          422
        )
      };
    }

    return { data: parsed.data };
  } catch (err) {
    return {
      errorResponse: errorResponse(
        "INVALID_JSON",
        "Failed parsing request body as JSON.",
        null,
        400
      )
    };
  }
}

// ─── Query Parameters Validation Helper ──────────────────────────────────────

export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  urlStr: string
): { data?: T; errorResponse?: NextResponse } {
  try {
    const { searchParams } = new URL(urlStr);
    const paramsObj: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });

    const parsed = schema.safeParse(paramsObj);

    if (!parsed.success) {
      const details = parsed.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message
      }));

      return {
        errorResponse: errorResponse(
          "QUERY_VALIDATION_ERROR",
          "Invalid query parameter values.",
          details,
          422
        )
      };
    }

    return { data: parsed.data };
  } catch (err) {
    return {
      errorResponse: errorResponse(
        "INVALID_URL",
        "Failed parsing request parameters URL.",
        null,
        400
      )
    };
  }
}
