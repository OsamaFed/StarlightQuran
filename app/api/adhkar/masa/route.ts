import { NextResponse } from "next/server";
import { getAdhkarMasa, getTotalItemsCount } from "@/lib/categorize-adhkar";
import type { AdhkarCategory, ApiResponse } from "@/types/adhkar";

export const revalidate = 3600;

export async function GET(): Promise<NextResponse<ApiResponse<AdhkarCategory[]>>> {
  try {
    const adhkarMasa = getAdhkarMasa();
    const totalItems = getTotalItemsCount(adhkarMasa);

    return NextResponse.json(
      {
        success: true,
        data: adhkarMasa,
        count: adhkarMasa.length,
        totalItems,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("[Adhkar Masa API] Error:", error);
    return NextResponse.json(
      { success: false, data: [], count: 0, totalItems: 0 },
      { status: 500 }
    );
  }
}
