// Supabase Edge Function: sol-siws-verify
// Purpose: Verify Phantom SIWS signature (public, CORS enabled)
// Notes: Time-bound verification (5min). No DB persistence.

import bs58 from 'npm:bs58';
import * as ed from 'npm:@noble/ed25519';
import { sha512 } from 'npm:@noble/hashes/sha512';

// Configure noble-ed25519 to use a sync sha512 implementation (required in Deno edge runtime)
function concatBytes(...arrays: Uint8Array[]) {
  const length = arrays.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}
// @ts-ignore - noble's etc is not typed in our env
(ed.etc || (ed as any).etc).sha512Sync = (...msgs: Uint8Array[]) => sha512(concatBytes(...msgs));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type VerifyBody = {
  address: string; // base58
  signatureHex: string; // hex
  message: string;
  nonce: string;
  issuedAt: string;
  domain: string;
};

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error('Invalid hex');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
  return out;
}

function withinFiveMinutes(iso: string): boolean {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  return Math.abs(Date.now() - t) <= 5 * 60 * 1000;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const body = (await req.json()) as VerifyBody;
    const { address, signatureHex, message, nonce, issuedAt } = body;

    if (!address || !signatureHex || !message || !nonce || !issuedAt) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Basic validation against replay
    if (!withinFiveMinutes(issuedAt)) {
      return new Response(JSON.stringify({ ok: false, error: 'Expired message' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Ensure the message contains expected fields
    if (!message.includes(address) || !message.includes(nonce)) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid message' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const pubkeyBytes = bs58.decode(address);
    const sigBytes = hexToBytes(signatureHex);
    const msgBytes = new TextEncoder().encode(message);

    const ok = await ed.verify(sigBytes, msgBytes, pubkeyBytes);

    return new Response(JSON.stringify({ ok, address }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (e) {
    console.error('sol-siws-verify error', e);
    return new Response(JSON.stringify({ ok: false, error: 'Unexpected error', details: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
