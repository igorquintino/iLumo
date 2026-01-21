// app/api/validate-coupon/route.ts
import { NextResponse } from "next/server";

const RASPADINHA_CODES: Record<string, any> = {
  ROXO10: { type: "percent", value: 10, label: "10% de desconto aplicado!" },
  FRETEGRATIS: { type: "freeShipping", label: "Frete grátis nesta compra!" },
  ADICIONAL: { type: "msg", label: "Ganhou um adicional grátis no próximo açaí!" },
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const code = body?.code;

    if (!code) {
      return NextResponse.json(
        { ok: false, message: "Código não enviado" },
        { status: 400 }
      );
    }

    const coupon = RASPADINHA_CODES[String(code).toUpperCase()];

    if (coupon) {
      return NextResponse.json({ ok: true, coupon }, { status: 200 });
    }

    return NextResponse.json(
      { ok: false, message: "Código inválido ou expirado" },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: "Erro ao validar cupom: " + (err?.message ?? "desconhecido") },
      { status: 500 }
    );
  }
}
