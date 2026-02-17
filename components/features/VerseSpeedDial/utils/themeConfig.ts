export const getThemeConfig = () => {
  let isDarkMode = false;
  let exportBg: string = "#FAF6F3";
  let gradientBg: string = "";

  try {
    const theme = document.documentElement.getAttribute("data-theme") || 
                  (document.body.classList.contains("darkMode") ? "dark" : "light");
    isDarkMode = theme === "dark";
    const computedBg = getComputedStyle(document.documentElement).getPropertyValue("--background") || "";

    if (isDarkMode) {
      exportBg = computedBg.trim() || "#0D1B2A";
      gradientBg = "radial-gradient(circle at 20% 30%, rgba(74, 144, 226, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(147, 112, 219, 0.25) 0%, transparent 50%)";
    } else {
      exportBg = "#F5F3F8";
      gradientBg = `
        radial-gradient(circle at 20% 30%, rgba(121, 85, 184, 0.6) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(70, 84, 201, 0.5) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(101, 155, 195, 0.45) 0%, transparent 60%),
        radial-gradient(circle at 15% 80%, rgba(97, 82, 198, 0.45) 0%, transparent 50%),
        linear-gradient(
          135deg,
          #7955B8 0%,
          #6587B5 15.11%,
          #6152C6 22.22%,
          #7256B3 33.33%,
          #43A0D6 44.44%,
          #4654C9 55.56%,
          #6253c8 66.67%,
          #5F54c6 77.78%,
          #6756c8 88.89%,
          #4761C8 90%
        )
      `;
    }
  } catch (e) {
    console.error("Error detecting theme:", e);
  }

  return { isDarkMode, exportBg, gradientBg };
};
