import { NextResponse } from "next/server";
import { firestore } from "@/libs/firebase/admin";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function GET() {
  const nonce = randomUUID();
  const issuedAt = new Date().toISOString();
  await firestore
    .collection("nonces")
    .doc(nonce)
    .set({ issuedAt, createdAt: new Date() });
  return NextResponse.json({ nonce, issuedAt });
}
