
import { NextResponse } from 'next/server';

const ORIGEM_LAT = -20.665541149082127;
const ORIGEM_LON = -43.804545918264765;

function distanciaEmKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function calcularPreco(distanciaKm: number) {
  if (distanciaKm <= 1) return 4.99;
  if (distanciaKm <= 3) return 7.99;
  if (distanciaKm <= 5) return 10.99;
  return 12.99;
}

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const resp = await fetch(url, { headers: { "User-Agent": "Roxo-Sabor-Next/1.0" } });
    const data = await resp.json();

    if (!data || !data.length) return NextResponse.json({ error: "Endereço não encontrado." }, { status: 404 });

    const dist = distanciaEmKm(ORIGEM_LAT, ORIGEM_LON, parseFloat(data[0].lat), parseFloat(data[0].lon));
    return NextResponse.json({ distanciaKm: dist, price: calcularPreco(dist) });
  } catch (err) {
    return NextResponse.json({ error: "Erro no cálculo." }, { status: 500 });
  }
}
