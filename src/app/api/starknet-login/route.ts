import { NextRequest, NextResponse } from "next/server";
import {
  RpcProvider,
  typedData as TD,
  shortString,
  type Signature,
  num,
  hash,
} from "starknet";
import { firestore } from "@/libs/firebase/admin";

const RPC_URL =
  process.env.STARKNET_RPC_URL ?? "https://starknet-mainnet.public.blastapi.io";
const RAW_CHAIN_ID = process.env.STARKNET_CHAIN_ID ?? "SN_MAIN"; // "SN_SEPOLIA" nếu testnet
const DOMAIN = {
  name: shortString.encodeShortString("Olympay"),
  version: shortString.encodeShortString("1"),
  chainId: shortString.encodeShortString(RAW_CHAIN_ID),
} as const;

function toFelt(input: string): string {
  // Nếu chuỗi <=31 ký tự ASCII, encode trực tiếp
  if (shortString.isShortString(input)) {
    return shortString.encodeShortString(input); // "0x..."
  }

  const k = hash.starknetKeccak(input); // có thể là bigint hoặc string tuỳ version
  return typeof k === "bigint" ? num.toHex(k) : String(k); // luôn trả "0x..."
}

function buildTypedData(
  address: string,
  nonceRaw: string,
  issuedAtRaw: string
) {
  const statement = shortString.encodeShortString("Sign in to Olympay");
  const nonce = toFelt(nonceRaw);
  const issuedAtSec = Math.floor(Date.parse(issuedAtRaw) / 1000).toString(); // decimal string OK cho felt

  return {
    domain: DOMAIN,
    primaryType: "Message",
    types: {
      StarkNetDomain: [
        { name: "name", type: "felt" },
        { name: "version", type: "felt" },
        { name: "chainId", type: "felt" },
      ],
      Message: [
        { name: "statement", type: "felt" },
        { name: "address", type: "felt" },
        { name: "nonce", type: "felt" },
        { name: "issuedAt", type: "felt" },
      ],
    },
    message: {
      statement,
      address,
      nonce,
      issuedAt: issuedAtSec,
    },
  } as const;
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { address, signature, nonce, issuedAt } = await req.json();
  if (!address || !signature || !nonce || !issuedAt) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const nRef = firestore.collection("nonces").doc(nonce);
  const nSnap = await nRef.get();
  if (!nSnap.exists) {
    return NextResponse.json({ error: "Invalid nonce" }, { status: 401 });
  }
  await nRef.delete();

  const addressLower = String(address).toLowerCase();
  const typed = buildTypedData(addressLower, nonce, issuedAt);

  const ok = await verifyTypedDataViaAccount({
    rpcUrl: RPC_URL,
    account: addressLower,
    data: typed,
    signature,
  });
  if (!ok) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  const userRef = firestore.collection("walletUsers").doc(addressLower);
  await userRef.set(
    {
      wallet: addressLower,
      email: null,
      name: null,
      points: 0,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    { merge: true }
  );

  const doc = await userRef.get();
  return NextResponse.json({ user: doc.data() });
}

type Sig =
  | Signature
  | string[]
  | bigint[]
  | { r: string | bigint; s: string | bigint };

function normalizeSignature(sig: unknown): string[] {
  if (Array.isArray(sig)) {
    return sig.map((v) => (typeof v === "bigint" ? num.toHex(v) : String(v)));
  }
  if (
    sig &&
    typeof sig === "object" &&
    "r" in (sig as any) &&
    "s" in (sig as any)
  ) {
    const { r, s } = sig as any;
    return [
      typeof r === "bigint" ? num.toHex(r) : String(r),
      typeof s === "bigint" ? num.toHex(s) : String(s),
    ];
  }
  throw new Error("Unsupported signature format");
}

async function verifyTypedDataViaAccount({
  rpcUrl,
  account,
  data, // typedData (SNIP-12)
  signature, // bigint[] | string[] | {r,s}
}: {
  rpcUrl: string;
  account: string;
  data: any;
  signature: Sig;
}): Promise<boolean> {
  const provider = new RpcProvider({ nodeUrl: rpcUrl });

  const anyProv = provider as any;
  if (typeof anyProv.verifyMessageInStarknet === "function") {
    return await anyProv.verifyMessageInStarknet(data, signature, account);
  }

  const msgHashHex = TD.getMessageHash(data, account);
  const sigHex = normalizeSignature(signature);
  const calldata: string[] = [msgHashHex, num.toHex(sigHex.length), ...sigHex];

  try {
    const res = await provider.callContract({
      contractAddress: account,
      entrypoint: "is_valid_signature",
      calldata,
    });
    const VALID = shortString.encodeShortString("VALID").toLowerCase();
    const out0 = res.result?.[0]?.toLowerCase?.();
    return out0 === VALID || out0 === num.toHex(1);
  } catch {
    return false;
  }
}
