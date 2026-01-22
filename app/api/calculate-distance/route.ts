// app/api/calculate-distance/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // recomendado p/ evitar treta de headers/fetch em edge

const ORIGEM_LAT = -20.665541149082127;
const ORIGEM_LON = -43.804545918264765;

type NominatimResult = {
  lat: string;
  lon: string;
};

// Haversine: distância em km entre dois pontos (lat, lon)
function distanciaEmKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
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

    const address = typeof body?.address === "string" ? body.address.trim() : "";

    if (!address) {
      return NextResponse.json({ error: "Endereço é obrigatório" }, { status: 400 });
    }

    // Nominatim (OpenStreetMap)
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      address
    )}`;

    const resp = await fetch(url, {
      headers: {
        // evite domínio fake; pode colocar algo simples
        "User-Agent": "Roxo-Sabor-App/1.0",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!resp.ok) {
      return NextResponse.json(
        { error: "Erro na comunicação com o serviço de mapas" },
        { status: 502 }
      );
    }

    const data = (await resp.json()) as NominatimResult[];

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Endereço não encontrado. Verifique Bairro e Rua." },
        { status: 404 }
      );
    }

    const destinoLat = Number.parseFloat(data[0].lat);
    const destinoLon = Number.parseFloat(data[0].lon);

    if (!Number.isFinite(destinoLat) || !Number.isFinite(destinoLon)) {
      return NextResponse.json(
        { error: "Coordenadas inválidas retornadas pelo serviço de mapas." },
        { status: 502 }
      );
    }

    const distanciaKm = distanciaEmKm(ORIGEM_LAT, ORIGEM_LON, destinoLat, destinoLon);
    const price = calcularPreco(distanciaKm);

    return NextResponse.json(
      {
        distanciaKm: Number(distanciaKm.toFixed(2)),
        price,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro ao calcular distância: " + (err?.message ?? "desconhecido") },
      { status: 500 }
    );
  }
}
