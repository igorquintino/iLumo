
import { NextResponse } from 'next/server';

const RASPADINHA_CODES: Record<string, any> = {
  "ROXO10": { type: "percent", value: 10, label: "10% de desconto aplicado!" },
  "FRETEGRATIS": { type: "freeShipping", label: "Frete grátis nesta compra!" },
  "ADICIONAL": { type: "msg", label: "Ganhou um adicional grátis no próximo açaí!" }
};

export async function POST(req: Request) {
  const { code } = await req.json();
  const upperCode = code?.toUpperCase();
  const coupon = RASPADINHA_CODES[upperCode];

  if (coupon) {
    return NextResponse.json({ ok: true, coupon });
  } else {
    return NextResponse.json({ ok: false, message: "Código inválido." }, { status: 404 });
  }
}
