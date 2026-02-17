import { NextResponse } from "next/server";
import { getAdhkarSabah, getTotalItemsCount } from "@/lib/categorize-adhkar";
import type { AdhkarCategory, ApiResponse } from "@/types/adhkar";


export const revalidate = 3600;

export async function GET(): Promise<NextResponse<ApiResponse<AdhkarCategory[]>>> {
  try {
    const adhkarSabah = getAdhkarSabah();
    const totalItems = getTotalItemsCount(adhkarSabah);

    return NextResponse.json(
      {
        success: true,
        data: adhkarSabah,
        count: adhkarSabah.length,
        totalItems,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("[Adhkar Sabah API] Error:", error);
    return NextResponse.json(
      { success: false, data: [], count: 0, totalItems: 0 },
      { status: 500 }
    );
  }
}
