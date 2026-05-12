import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Ni avtorizacije" }, { status: 401 });

  const { naslov, opis, kategorija, cena } = await req.json();
  if (!naslov || !kategorija || !cena) {
    return NextResponse.json({ error: "Manjkajo podatki" }, { status: 400 });
  }

  const message = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 256,
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: `Si strokovnjak za cene storitev v Sloveniji. Oceni ali je cena primerna za naslednjo nalogo.

Naslov: ${naslov}
Opis: ${opis || "(ni opisa)"}
Kategorija: ${kategorija}
Cena: ${cena} €

Odgovori SAMO z enim od naslednjih JSON objektov (brez markdown, brez dodatnega besedila):
{"ocena":"prenizka","razlaga":"<kratka razlaga v slovenščini>"}
{"ocena":"primerna","razlaga":"<kratka razlaga v slovenščini>"}
{"ocena":"previsoka","razlaga":"<kratka razlaga v slovenščini>"}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json({ error: "Napaka pri oceni" }, { status: 500 });
  }

  try {
    const parsed = JSON.parse(textBlock.text.trim());
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Napaka pri razčlenjevanju odgovora" }, { status: 500 });
  }
}
