import { NextResponse } from "next/server";
import { getDuas, getTotalItemsCount } from "@/lib/categorize-adhkar";
import type { AdhkarCategory, ApiResponse } from "@/types/adhkar";

export const revalidate = 3600;

export async function GET(): Promise<NextResponse<ApiResponse<AdhkarCategory[]>>> {
  try {
    const duas = getDuas();
    const totalItems = getTotalItemsCount(duas);

    return NextResponse.json(
      {
        success: true,
        data: duas,
        count: duas.length,
        totalItems,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("[Duas API] Error:", error);
    return NextResponse.json(
      { success: false, data: [], count: 0, totalItems: 0 },
      { status: 500 }
    );
  }
}
