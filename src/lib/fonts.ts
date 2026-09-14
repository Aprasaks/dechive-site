import { Caveat, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";

export const body = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const editorial = Noto_Serif_KR({
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
});

export const handwriting = Caveat({
  subsets: ["latin"],
  variable: "--font-handwriting",
  display: "swap",
});
