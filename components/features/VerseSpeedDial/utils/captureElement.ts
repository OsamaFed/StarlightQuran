import { CAPTURE_CONFIG } from "../constants";
import { getThemeConfig } from "./themeConfig";

export const prepareElementForCapture = (el: HTMLElement) => {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.setAttribute("dir", "rtl");
  clone.style.direction = "rtl";

  const speedDialButtons = clone.querySelectorAll('[data-verse-speeddial], [class*="SpeedDial"], [data-html2canvas-ignore="true"]');
  speedDialButtons.forEach((btn) => {
    (btn as HTMLElement).style.display = "none";
  });

  const rect = el.getBoundingClientRect();
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.boxSizing = "border-box";
  clone.style.margin = "0";
  clone.style.padding = clone.style.padding || "20px";
  clone.style.color = "#ffffff";

  return { clone, width: rect.width, height: rect.height };
};

export const createCaptureContainer = (
  clone: HTMLElement,
  width: number,
  height: number,
  exportBg: string,
  gradientBg: string
) => {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.zIndex = "2147483647";
  container.style.backgroundColor = exportBg;
  container.style.backgroundImage = gradientBg;
  container.style.backgroundAttachment = "fixed";
  container.style.overflow = "hidden";
  container.appendChild(clone);
  document.body.appendChild(container);
  return container;
};

export async function captureElementAsBlob(el: HTMLElement): Promise<Blob | null> {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const { clone, width, height } = prepareElementForCapture(el);
    const { exportBg, gradientBg } = getThemeConfig();
    const container = createCaptureContainer(clone, width, height, exportBg, gradientBg);

    try {
      const canvas = await html2canvas(container, {
        backgroundColor: exportBg,
        scale: CAPTURE_CONFIG.SCALE,
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: CAPTURE_CONFIG.IMAGE_TIMEOUT,
        windowHeight: height,
        windowWidth: width,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), CAPTURE_CONFIG.IMAGE_FORMAT, CAPTURE_CONFIG.IMAGE_QUALITY);
      });
    } finally {
      container.remove();
    }
  } catch (error) {
    console.error("Error capturing element as blob:", error);
    return null;
  }
}
