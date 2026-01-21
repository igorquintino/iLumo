// app/api/calculate-distance/route.ts
import { NextResponse } from "next/server";

const ORIGEM_LAT = -20.665541149082127;
const ORIGEM_LON = -43.804545918264765;

// Haversine: distância em km entre dois pontos (lat, lon)
function distanciaEmKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // raio da Terra em km
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// TABELA DE PREÇO
function calcularPreco(distanciaKm: number) {
  if (distanciaKm <= 1) return 4.99;
  if (distanciaKm <= 2) return 6.99;
  if (distanciaKm <= 3) return 7.99;
  if (distanciaKm <= 4) return 8.99;
  if (distanciaKm <= 5) return 10.99;
  if (distanciaKm <= 5.5) return 11.99;
  return 12.99;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const address = body?.address;

    if (!address) {
      return NextResponse.json({ error: "Endereço é obrigatório" }, { status: 400 });
    }

    // Nominatim (OpenStreetMap)
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      address
    )}`;

    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Roxo-Sabor-App/1.0 (contato@roxosabor.com.br)",
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (!resp.ok) {
      return NextResponse.json(
        { error: "Erro na comunicação com o serviço de mapas" },
        { status: 502 }
      );
    }

    const data = (await resp.json()) as any[];

    if (!data?.length) {
      return NextResponse.json(
        { error: "Endereço não encontrado. Verifique Bairro e Rua." },
        { status: 404 }
      );
    }

    const destinoLat = parseFloat(data[0].lat);
    const destinoLon = parseFloat(data[0].lon);

    const distanciaKm = distanciaEmKm(ORIGEM_LAT, ORIGEM_LON, destinoLat, destinoLon);
    const price = calcularPreco(distanciaKm);

    return NextResponse.json({
      distanciaKm: Number(distanciaKm.toFixed(2)),
      price,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro ao calcular distância: " + (err?.message ?? "desconhecido") },
      { status: 500 }
    );
  }
}

// Se você estiver usando runtime edge e der problema com fetch/headers, descomenta:
// export const runtime = "nodejs";
