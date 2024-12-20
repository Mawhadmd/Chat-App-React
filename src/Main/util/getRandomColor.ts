import { calculateContrastRatio } from "./calculateContrastRatio";

export function getRandomColor(bgcolor: string) {
    var color = null;
    let contrast = -1;
    var colorarray;
    let bgcolorarray = bgcolor.split(",").map((e) => Number(e));
    while (contrast <= 6) {
      let letters = "0123456789ABCDEF";
      color = "#";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }

      let colorshex = color.slice(1).split("");
      colorarray = [
        Number(`0x${colorshex[0]}${colorshex[1]}`),
        Number(`0x${colorshex[2]}${colorshex[3]}`),
        Number(`0x${colorshex[4]}${colorshex[5]}`),
      ];

      contrast = calculateContrastRatio(bgcolorarray, colorarray);
    }

    return color;
  }