export function calculateContrastRatio(
    color1: Array<Number>,
    color2: Array<Number>
  ) {
    // Calculate relative luminance
    function getLuminance(color: Array<Number>) {
      let [r, g, b] = color.map((c: any) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    // Calculate luminance for both colors
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);

    // Determine lighter and darker luminance
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    // Calculate contrast ratio
    const contrastRatio = (lighter + 0.05) / (darker + 0.05);
    return Number(contrastRatio.toFixed(2));
  }