import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { authLog } from '@/lib/authDebug';
export type SiwsNonceResponse = {
  message: string;
  nonce: string;
  issuedAt: string;
  domain: string;
};

export type SiwsVerifyRequest = {
  address: string; // base58
  signatureHex: string; // hex string
  message: string;
  nonce: string;
  issuedAt: string;
  domain: string;
};

export function useSiwsSolana() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNonce = useCallback(async (address: string, domain: string): Promise<SiwsNonceResponse> => {
    const { data, error } = await supabase.functions.invoke('sol-siws-nonce', {
      body: { address, domain },
    });
    if (error) throw error;
    return data as SiwsNonceResponse;
  }, []);

  const verify = useCallback(async (req: SiwsVerifyRequest): Promise<boolean> => {
    const { data, error } = await supabase.functions.invoke('sol-siws-verify', {
      body: req,
    });
    if (error) throw error;
    return Boolean((data as any)?.ok);
  }, []);

  const signAndVerify = useCallback(
    async (address: string, signMessage: (message: Uint8Array) => Promise<Uint8Array>) => {
      try {
        setLoading(true);
        setError(null);
        const domain = window.location.host;
        const nonceRes = await getNonce(address, domain);
        const bytes = new TextEncoder().encode(nonceRes.message);
        const sigBytes = await signMessage(bytes);
        const signatureHex = Array.from(sigBytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        const ok = await verify({
          address,
          signatureHex,
          message: nonceRes.message,
          nonce: nonceRes.nonce,
          issuedAt: nonceRes.issuedAt,
          domain: nonceRes.domain,
        });
        return ok;
      } catch (e: any) {
        setError(String(e.message || e));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getNonce, verify]
  );

  return { loading, error, signAndVerify };
}
