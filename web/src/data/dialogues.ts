export interface Dialogue {
  id: string;
  quote: string;
  file: string;
  durationSec: number;
}

export const DIALOGUES: Dialogue[] = [
  {
    id: "didi-o-didi",
    quote: "Didi O Didi!",
    file: "didi-o-didi.mp3",
    durationSec: 10,
  },
  {
    id: "hypocrisy",
    quote: "Hypocrisy ki bhi seema hoti hai!",
    file: "hypocrisy.mp3",
    durationSec: 8,
  },
  {
    id: "sanskrit-sloka",
    quote: "Sanskrit Shloka in Parliament",
    file: "sanskrit-sloka.mp3",
    durationSec: 12,
  },
  {
    id: "waah-waah",
    quote: "Waah! Waah!",
    file: "waah.mp3",
    durationSec: 8,
  },
  {
    id: "aloo-se-sona",
    quote: "Idhar se aloo daaloge, udhar se sona niklega!",
    file: "idhar-se-aloo.mp3",
    durationSec: 10,
  },
  {
    id: "maja-aya",
    quote: "Maja aaya!",
    file: "maja-aya.mp3",
    durationSec: 6,
  },
  {
    id: "iss-sajjan-ko",
    quote: "Iss sajjan ko kya takleef hai bhai!",
    file: "iss-sajjan-ko.mp3",
    durationSec: 8,
  },
  {
    id: "khela-hobe",
    quote: "Khela Hobe!",
    file: "khela-hobe.mp3",
    durationSec: 8,
  },
  {
    id: "hamba-hamba",
    quote: "Hamba! Hamba!",
    file: "hamba-hamba.mp3",
    durationSec: 6,
  },
  {
    id: "go-corona",
    quote: "Go Corona, Corona Go!",
    file: "go-corona.mp3",
    durationSec: 10,
  },
  {
    id: "loksabha",
    quote: "A Lok Sabha moment",
    file: "on-lokshava.mp3",
    durationSec: 10,
  },
  {
    id: "to-karo-na",
    quote: "To karo na!",
    file: "to-karo-na.mp3",
    durationSec: 6,
  },
  {
    id: "jaan-de-denge",
    quote: "Hum jaan de denge!",
    file: "jaan-de-denge.mp3",
    durationSec: 8,
  },
];
