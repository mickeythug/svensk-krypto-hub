import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAccount, useConnect, useDisconnect, useSignMessage, useSwitchChain, useChains } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { toast } from "@/hooks/use-toast";
import { authLog } from "@/lib/authDebug";
import { Wallet, CheckCircle2, ExternalLink, Shield, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiwsSolana } from "@/hooks/useSiwsSolana";

export default function MobileConnectPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const chain = (params.get("chain") || "").toLowerCase();
  const walletPref = (params.get("wallet") || "").toLowerCase();
  const redirect = params.get("redirect") || "/portfolio";

  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();
  const chains = useChains();
  const ethMainnet = useMemo(() => chains.find((c) => c.id === 1), [chains]);

  const { connect: connectSol, publicKey, signMessage: signMessageSol, wallets, select, wallet } = useWallet();
  const { setVisible: setWalletModalVisible } = useWalletModal();
  const { signAndVerify } = useSiwsSolana();

  const [status, setStatus] = useState<string>("Förbereder...");

  // Hjälpare för stabil Phantom-initiering i mobil in-app browser
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const waitForPhantomProvider = async () => {
    for (let i = 0; i < 120; i++) {
      if ((window as any)?.solana?.isPhantom) return;
      await wait(50);
    }
    throw new Error("Phantom provider ej tillgänglig. Öppna via Phantom-länken igen.");
  };
  const isInPhantomInApp = () => {
    const ua = navigator.userAgent || "";
    return /Phantom/i.test(ua) || (window as any)?.solana?.isPhantom;
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        if (chain === "sol") {
          setStatus("Öppnar i Phantom..."); authLog("SOL connect: start");
          const phantomWallet = wallets?.find((w: any) => w?.adapter?.name === "Phantom");
          if (phantomWallet && wallet?.adapter?.name !== phantomWallet.adapter.name) {
            select?.(phantomWallet.adapter.name as any);
            await wait(50);
          }

          // Säkerställ att vi kör i Phantoms in‑app browser och att provider finns
          try {
            await waitForPhantomProvider();
          } catch {
            if (!isInPhantomInApp()) {
              const deeplink = `https://phantom.app/ul/browse/${encodeURIComponent(window.location.origin + "/connect?chain=sol&redirect=" + encodeURIComponent(redirect))}`;
              window.location.href = deeplink;
              return;
            }
          }

          setStatus("Begär anslutning i Phantom...");
          await connectSol(); authLog("SOL connect invoked");

          // Vänta upp till 10s på att Phantom sätter publicKey
          let pk = publicKey;
          for (let i = 0; i < 200 && !pk; i++) {
            await wait(50);
            pk = publicKey;
          }
          const pubkeyStr = pk?.toBase58?.(); if (pubkeyStr) authLog("SOL publicKey", pubkeyStr);
          if (!pubkeyStr) throw new Error("Kunde inte läsa Solana‑adress från Phantom");

          const canAdapterSign = typeof signMessageSol === "function";
          if (!canAdapterSign) {
            // Fallback: öppna Phantom deeplink till vår connect-sida för in-app signering
            if (!isInPhantomInApp()) {
              const deeplink = `https://phantom.app/ul/browse/${encodeURIComponent(window.location.origin + "/connect?chain=sol&redirect=" + encodeURIComponent(redirect))}`;
              window.location.href = deeplink;
              return;
            }
            throw new Error("Phantom saknar signMessage-stöd i denna miljö");
          }

          // SIWS: Signera exakt serverns nonce-meddelande och verifiera
          authLog("SOL signing & verify: start");
          const ok = await signAndVerify(pubkeyStr, signMessageSol as any);
          if (!ok) throw new Error("Verifiering misslyckades");
          authLog("SOL verified ok");
          sessionStorage.setItem("siws_verified", "true");
          sessionStorage.setItem("siws_address", pubkeyStr);
          toast({ title: "Ansluten", description: "Solana ansluten och verifierad." });
          navigate(redirect, { replace: true });
          return;
        }

        if (chain === "evm") {
          setStatus("Ansluter till EVM‑wallet...");
          // Välj connector
          const injected = connectors.find((c) => c.id === "injected");
          const chosen = injected || connectors[0];
          await connect({ connector: chosen });
          if (ethMainnet) {
            try { await switchChainAsync({ chainId: ethMainnet.id }); } catch {}
          }
          const message = `Signera för att bekräfta ägarskap\n\nDomän: ${window.location.host}`;
          const signature = await signMessageAsync({ message } as any);
          const { data, error } = await supabase.functions.invoke("siwe-verify", { body: { address, message, signature } });
          if (error || !(data as any)?.ok) throw new Error((error as any)?.message || "Serververifiering misslyckades");
          sessionStorage.setItem("siwe_signature", signature as any);
          if (address) sessionStorage.setItem("siwe_address", address);
          sessionStorage.setItem("siwe_verified", "true");
          toast({ title: "Ansluten", description: "EVM ansluten och verifierad." });
          navigate(redirect, { replace: true });
          return;
        }

        setStatus("Välj kedja nedan för att ansluta.");
      } catch (e: any) {
        authLog("MobileConnectPage error", String(e?.message || e), "error");
        toast({ title: "Kunde inte ansluta", description: String(e?.message || e), variant: "destructive" });
      }
    };
    if (mounted) run();
    return () => { mounted = false; };
  }, [chain, walletPref]);

  return (
    <Layout title="Anslut plånbok" showTicker={false}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-10">
          <Card className="p-6 bg-card/80 backdrop-blur-xl border-border">
            <div className="flex items-center mb-4">
              <Wallet className="h-5 w-5 text-primary mr-2" />
              <h1 className="font-crypto text-xl">Mobil anslutning</h1>
            </div>
            <p className="text-muted-foreground mb-6">{status}</p>

            <div className="grid grid-cols-1 gap-3">
              <a href={`https://phantom.app/ul/browse/${encodeURIComponent(window.location.origin + "/connect?chain=sol&redirect=" + encodeURIComponent(redirect))}`} rel="noopener noreferrer">
                <Button className="w-full justify-between">
                  Phantom (Solana)
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <a href={`https://metamask.app.link/dapp/${window.location.host}/connect?chain=evm&wallet=metamask&redirect=${encodeURIComponent(redirect)}`} rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-between">
                  MetaMask (Ethereum)
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <a href={`https://link.trustwallet.com/open_url?url=${encodeURIComponent(window.location.origin + "/connect?chain=evm&wallet=trust&redirect=" + encodeURIComponent(redirect))}`} rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-between">
                  Trust Wallet (EVM)
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
            <div className="mt-4 text-xs text-muted-foreground flex items-center">
              <Shield className="h-3.5 w-3.5 mr-2" />
              Säker signering enligt officiell dokumentation för Phantom deeplinks och MetaMask/Trust deeplinks.
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
