import { quranClient } from "@/lib/quran";
import { NextResponse } from "next/server";

export const revalidate = 86400;

const MIN_SURAH = 1;
const MAX_SURAH = 114;
const FETCH_TIMEOUT_MS = 8000;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const surahId = parseInt(id, 10);
  if (isNaN(surahId) || surahId < MIN_SURAH || surahId > MAX_SURAH) {
    return NextResponse.json(
      { code: 400, message: `رقم السورة يجب أن يكون بين ${MIN_SURAH} و${MAX_SURAH}` },
      { status: 400 }
    );
  }

  const url = new URL(req.url);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const [chapter, verses] = await Promise.all([
      quranClient.chapters.findById(String(surahId) as any),
      quranClient.verses.findByChapter(String(surahId) as any, {
        perPage: 300,
        fields: { textUthmani: true },
      }),
    ]);

    clearTimeout(timeoutId);

    return NextResponse.json(
      {
        code: 200,
        data: {
          number: chapter.id,
          name: chapter.nameArabic,
          ayahs: verses.map((v: any) => ({
            numberInSurah: v.verseNumber,
            text: v.textUthmani || v.text || "",
          })),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch (error: any) {
    clearTimeout(timeoutId);

    const isTimeout = error.name === "AbortError";
    const isNotFound = error.message?.includes("404") || error.status === 404;

    if (isTimeout) {
      console.error(`[Quran API] Timeout fetching surah ${surahId}`);
      return NextResponse.json(
        { code: 503, message: "انتهت مهلة الاتصال، يرجى المحاولة مرة أخرى" },
        { status: 503 }
      );
    }

    if (isNotFound) {
      return NextResponse.json(
        { code: 404, message: "السورة غير موجودة" },
        { status: 404 }
      );
    }

    console.error(`[Quran API] Error fetching surah ${surahId}:`, error.message);
    return NextResponse.json(
      { code: 500, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً" },
      { status: 500 }
    );
  }
}
