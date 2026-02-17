import { NextResponse } from "next/server";

const TAFSIR_ID = 16; 
const QURAN_API_BASE = "https://api.quran.com/api/v4/tafsirs";
const TIMEOUT_MS = 8000;

export const revalidate = 86400;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const surah = searchParams.get("surah");
  const ayah = searchParams.get("ayah");

  if (!surah || !ayah) {
    return NextResponse.json(
      { code: 400, message: "Missing required parameters: surah and ayah" },
      { status: 400 }
    );
  }

  const surahNum = parseInt(surah, 10);
  const ayahNum = parseInt(ayah, 10);

  if (isNaN(surahNum) || isNaN(ayahNum) || surahNum < 1 || surahNum > 114 || ayahNum < 1) {
    return NextResponse.json(
      { code: 400, message: "Invalid surah or ayah number" },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${QURAN_API_BASE}/${TAFSIR_ID}/by_ayah/${surahNum}:${ayahNum}`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "StarLightQuran/1.0",
        "Accept": "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { code: 404, message: "التفسير غير متوفر لهذه الآية" },
          { status: 404 }
        );
      }
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    
    const rawText = data.tafsir?.text || "التفسير غير متوفر حالياً";
    const tafsirText = rawText.replace(/<[^>]*>/g, "").trim();

    return NextResponse.json(
      {
        code: 200,
        data: {
          surah: surahNum,
          ayah: ayahNum,
          tafsir: tafsirText,
          source: "quran.com",
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

    if (error.name === "AbortError") {
      return NextResponse.json(
        { code: 503, message: "انتهت مهلة الاتصال بخدمة التفسير" },
        { status: 503 }
      );
    }

    if (error instanceof TypeError) {
      return NextResponse.json(
        { code: 503, message: "خطأ في الاتصال بخدمة التفسير" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { code: 500, message: "حدث خطأ داخلي أثناء جلب التفسير" },
      { status: 500 }
    );
  }
}
