interface ASLRule {
    letter: string;
    conditions: (landmarks: any[]) => boolean;
  }
  


export const ASL_RULES: ASLRule[] = [
    {
      letter: "A",
      conditions: (lm) =>
        lm[4].x < lm[3].x && // thumb to side
        [8, 12, 16, 20].every((tip, i) => lm[tip].y > lm[[6, 10, 14, 18][i]].y), // all fingers curled
    },
    {
      letter: "B",
      conditions: (lm) =>
        [8, 12, 16, 20].every((tip, i) => lm[tip].y < lm[[6, 10, 14, 18][i]].y) && // fingers up
        lm[4].y > lm[6].y, // thumb across palm
    },
    {
      letter: "C",
      conditions: (lm) =>
        Math.abs(lm[8].x - lm[4].x) > 0.1 &&
        Math.abs(lm[8].y - lm[20].y) < 0.1, // curved spread
    },
    {
      letter: "D",
      conditions: (lm) =>
        lm[8].y < lm[6].y && // index up
        [12, 16, 20].every((tip, i) => lm[tip].y > lm[[10, 14, 18][i]].y), // others down
    },
    {
      letter: "E",
      conditions: (lm) =>
        [8, 12, 16, 20].every((tip, i) => lm[tip].y > lm[[6, 10, 14, 18][i]].y) && // curled
        lm[4].y > lm[6].y, // thumb across
    },
    {
      letter: "F",
      conditions: (lm) => {
        const dx = lm[8].x - lm[4].x;
        const dy = lm[8].y - lm[4].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < 0.05; // thumb + index touching
      },
    },
    {
      letter: "G",
      conditions: (lm) =>
        lm[8].y > lm[6].y && // index flat
        lm[4].x < lm[3].x, // thumb extended to side
    },
    {
      letter: "H",
      conditions: (lm) =>
        lm[8].y < lm[6].y && lm[12].y < lm[10].y && // index + middle up
        lm[16].y > lm[14].y && lm[20].y > lm[18].y, // ring + pinky down
        // thumb position can vary slightly
    },
    {
      letter: "I",
      conditions: (lm) =>
        lm[20].y < lm[18].y && // pinky up
        [8, 12, 16].every((tip, i) => lm[tip].y > lm[[6, 10, 14][i]].y), // others down
    },
    {
      letter: "K",
      conditions: (lm) =>
        lm[8].y < lm[6].y && lm[12].y < lm[10].y && // index + middle up
        lm[4].x < lm[3].x, // thumb extended between
    },
    {
      letter: "L",
      conditions: (lm) =>
        lm[8].y < lm[6].y && // index up
        lm[4].x < lm[3].x && // thumb extended
        [12, 16, 20].every((tip, i) => lm[tip].y > lm[[10, 14, 18][i]].y),
    },
    {
      letter: "M",
      conditions: (lm) =>
        lm[8].y > lm[6].y &&
        lm[12].y > lm[10].y &&
        lm[16].y > lm[14].y && // 3 fingers over thumb
        lm[4].x > lm[8].x,
    },
    {
      letter: "N",
      conditions: (lm) =>
        lm[8].y > lm[6].y &&
        lm[12].y > lm[10].y && // 2 fingers over thumb
        lm[4].x > lm[8].x,
    },
    {
      letter: "O",
      conditions: (lm) => {
        const dx = lm[4].x - lm[8].x;
        const dy = lm[4].y - lm[8].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < 0.05 && // thumb + index closed
          Math.abs(lm[12].y - lm[16].y) < 0.05 &&
          Math.abs(lm[12].x - lm[16].x) < 0.05;
      },
    },
    {
      letter: "P",
      conditions: (lm) =>
        lm[8].y > lm[6].y && lm[12].y < lm[10].y && // index down, middle up
        lm[4].x < lm[3].x,
    },
    {
      letter: "Q",
      conditions: (lm) =>
        lm[8].y > lm[6].y && // index down
        lm[4].x < lm[3].x, // thumb out
        // similar to G but index points downward
    },
    {
      letter: "R",
      conditions: (lm) =>
        lm[8].y < lm[6].y && lm[12].y < lm[10].y && // index + middle up
        Math.abs(lm[8].x - lm[12].x) < 0.03,
    },
    {
      letter: "S",
      conditions: (lm) =>
        [8, 12, 16, 20].every((tip, i) => lm[tip].y > lm[[6, 10, 14, 18][i]].y) &&
        lm[4].y < lm[3].y,
    },
    {
      letter: "T",
      conditions: (lm) =>
        lm[4].x > lm[6].x && // thumb between index and middle
        lm[8].y > lm[6].y,
    },
    {
      letter: "U",
      conditions: (lm) =>
        lm[8].y < lm[6].y && lm[12].y < lm[10].y && // index + middle up
        Math.abs(lm[8].x - lm[12].x) < 0.05,
    },
    {
      letter: "V",
      conditions: (lm) =>
        lm[8].y < lm[6].y && lm[12].y < lm[10].y && // index + middle up
        Math.abs(lm[8].x - lm[12].x) > 0.05,
    },
    {
      letter: "W",
      conditions: (lm) =>
        lm[8].y < lm[6].y && lm[12].y < lm[10].y && lm[16].y < lm[14].y &&
        lm[20].y > lm[18].y,
    },
    {
      letter: "X",
      conditions: (lm) =>
        lm[8].x < lm[6].x &&
        lm[8].y > lm[6].y,
    },
    {
      letter: "Y",
      conditions: (lm) =>
        lm[20].y < lm[18].y && lm[4].x < lm[3].x &&
        [8, 12, 16].every((tip, i) => lm[tip].y > lm[[6, 10, 14][i]].y),
    },
  ];
  