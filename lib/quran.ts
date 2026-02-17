import { QuranClient } from "@quranjs/api";


if (typeof window === "undefined") {
  if (!process.env.QF_CLIENT_ID || !process.env.QF_CLIENT_SECRET) {
    console.error(
      "❌ [lib/quran] QF_CLIENT_ID أو QF_CLIENT_SECRET غير موجودة في متغيرات البيئة.\n" +
      "   أضفهما في ملف .env.local أو في إعدادات Replit Secrets."
    );
  }
}


let _quranClient: QuranClient | null = null;

export function getQuranClient(): QuranClient {
  if (!_quranClient) {
    _quranClient = new QuranClient({
      clientId: process.env.QF_CLIENT_ID || "",
      clientSecret: process.env.QF_CLIENT_SECRET || "",
    });
  }
  return _quranClient;
}


export const quranClient = {
  get chapters() {
    return getQuranClient().chapters;
  },
  get verses() {
    return getQuranClient().verses;
  },
};
