export interface Dialogue {
  id: string;
  politician: string;
  party?: string;
  quote: string;
  file: string;
  durationSec: number;
}

export const DIALOGUES: Dialogue[] = [
  {
    id: "modi-didi-o-didi",
    politician: "Narendra Modi",
    party: "BJP",
    quote: "Didi O Didi!",
    file: "modiji-didi-o-didi.mp3",
    durationSec: 10,
  },
  {
    id: "modi-hypocrisy",
    politician: "Narendra Modi",
    party: "BJP",
    quote: "Hypocrisy ki bhi seema hoti hai!",
    file: "modiji-hypocrisy.mp3",
    durationSec: 8,
  },
  {
    id: "modi-sanskrit-sloka",
    politician: "Narendra Modi",
    party: "BJP",
    quote: "Sanskrit Shloka in Parliament",
    file: "modiji-sanskrit-sloka.mp3",
    durationSec: 12,
  },
  {
    id: "modi-waah-modiji-waah",
    politician: "Narendra Modi",
    party: "BJP",
    quote: "Waah Modiji Waah!",
    file: "modiji-waah-modiji-waah.mp3",
    durationSec: 8,
  },
  {
    id: "rahul-aloo-se-sona",
    politician: "Rahul Gandhi",
    party: "INC",
    quote: "Idhar se aloo daaloge, udhar se sona niklega!",
    file: "rahul-gadhi-idhar-se-aloo.mp3",
    durationSec: 10,
  },
  {
    id: "rahul-maja-aya",
    politician: "Rahul Gandhi",
    party: "INC",
    quote: "Maja aaya!",
    file: "rahul-gandhi-maja-aya.mp3",
    durationSec: 6,
  },
];
