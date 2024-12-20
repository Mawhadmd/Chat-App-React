function getRandomColor(bgcolor) {
    var color = null
    let contrast = -1
    let bgcolorarray = bgcolor.split(',').map(e => Number(e))
    while (contrast>7 || contrast<5){
    let letters = "0123456789ABCDEF";
     color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
   
    let colorshex = color.slice(1).split('');
    let colorarray = [Number(`0x${colorshex[0]}${colorshex[1]}`),Number(`0x${colorshex[2]}${colorshex[3]}`),Number(`0x${colorshex[4]}${colorshex[5]}`)]
    contrast = calculateContrastRatio(bgcolorarray,colorarray)
  }
    return color;
  }
  function calculateContrastRatio(
    color1,
    color2
  ) {
    // Calculate relative luminance
    function getLuminance(color) {
      let [r, g, b] = color.map((c) => {
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
 