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
  {
    id: "modi-iss-sajjan-ko",
    politician: "Narendra Modi",
    party: "BJP",
    quote: "Iss sajjan ko kya takleef hai bhai!",
    file: "modiji-iss-sajjan-ko.mp3",
    durationSec: 8,
  },
  {
    id: "mamata-khela-hobe",
    politician: "Mamata Banerjee",
    party: "TMC",
    quote: "Khela Hobe!",
    file: "TMC-used-khela-hobe.mp3",
    durationSec: 8,
  },
  {
    id: "mamata-hamba-hamba",
    politician: "Mamata Banerjee",
    party: "TMC",
    quote: "Hamba! Hamba!",
    file: "didi-hamba-hamba.mp3",
    durationSec: 6,
  },
  {
    id: "athawale-go-corona",
    politician: "Ramdas Athawale",
    party: "RPI(A)",
    quote: "Go Corona, Corona Go!",
    file: "ramdas-athawale-go-corona.mp3",
    durationSec: 10,
  },
  {
    id: "rakhi-gupta-file-nahi-padhti",
    politician: "Rakhi Gupta",
    quote: "Main file nahi padhti!",
    file: "rakha-gupta-main-file-nahi-padhti.mp3",
    durationSec: 8,
  },
  {
    id: "lalu-loksabha",
    politician: "Lalu Prasad Yadav",
    party: "RJD",
    quote: "Lalu ji on Lok Sabha",
    file: "lalu-on-lokshava.mp3",
    durationSec: 10,
  },
  {
    id: "kejriwal-to-karo-na",
    politician: "Arvind Kejriwal",
    party: "AAP",
    quote: "To karo na!",
    file: "arvind-kejriwal-to-karo-na.mp3",
    durationSec: 6,
  },
  {
    id: "amit-shah-jaan-de-denge",
    politician: "Amit Shah",
    party: "BJP",
    quote: "Hum jaan de denge!",
    file: "amit-shah-jaan-de-denge.mp3",
    durationSec: 8,
  },
];
