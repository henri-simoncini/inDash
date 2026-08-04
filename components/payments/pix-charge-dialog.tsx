"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Copy, QrCode, Settings } from "lucide-react";
import { toast } from "sonner";
import { buildPixPayload, type PixKeyType } from "@/lib/pix";
import { formatBRL } from "@/lib/format";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type PixProfile = {
  key: string;
  keyType: PixKeyType;
  name: string;
  city: string;
} | null;

export function PixChargeDialog({
  open,
  onOpenChange,
  amount,
  projectTitle,
  pix,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  projectTitle: string;
  pix: PixProfile;
}) {
  const [qr, setQr] = useState<string>();
  const [copied, setCopied] = useState(false);

  const payload = pix
    ? buildPixPayload({
        key: pix.key,
        keyType: pix.keyType,
        merchantName: pix.name,
        merchantCity: pix.city,
        amount,
      })
    : null;

  useEffect(() => {
    if (!open || !payload) return;
    let active = true;

    // Carregado sob demanda: o gerador de QR não precisa entrar no bundle
    // de quem nunca abre esta tela.
    import("qrcode").then(async ({ default: QRCode }) => {
      const url = await QRCode.toDataURL(payload, {
        width: 512,
        margin: 1,
        color: { dark: "#0A0D14", light: "#FFFFFF" },
      });
      if (active) setQr(url);
    });

    return () => {
      active = false;
    };
  }, [open, payload]);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setQr(undefined);
    }
  }, [open]);

  async function copyPayload() {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      toast.success("Código copiado. É só colar no WhatsApp.");
    } catch {
      toast.error("Não foi possível copiar. Selecione o código manualmente.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-4" aria-hidden /> Cobrar via Pix
          </DialogTitle>
          <DialogDescription>
            {pix
              ? `${projectTitle} — o cliente escaneia e o valor já vai preenchido.`
              : "Cadastre sua chave Pix para gerar cobranças."}
          </DialogDescription>
        </DialogHeader>

        {!pix ? (
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Você ainda não cadastrou uma chave de recebimento. Leva menos de
              um minuto e vale para todos os projetos.
            </p>
            <Link
              href="/dashboard/configuracoes"
              className={buttonVariants({ className: "w-full" })}
            >
              <Settings /> Cadastrar chave Pix
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-xl bg-white p-3">
                {qr ? (
                  <Image
                    src={qr}
                    alt="QR code de pagamento Pix"
                    width={220}
                    height={220}
                    unoptimized
                  />
                ) : (
                  <div className="size-[220px] animate-pulse rounded bg-muted" />
                )}
              </div>
              <p className="font-heading text-3xl">{formatBRL(amount)}</p>
              <p className="-mt-2 text-xs text-muted-foreground">
                para {pix.name}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Pix copia e cola
              </p>
              <div className="max-h-20 overflow-y-auto break-all rounded-md border bg-muted/40 p-2 text-[0.7rem] leading-relaxed">
                {payload}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={copyPayload}
              >
                {copied ? <Check /> : <Copy />}
                {copied ? "Copiado" : "Copiar código"}
              </Button>
            </div>

            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-muted-foreground">
              O banco não avisa o inDash quando o dinheiro cai. Depois de
              receber, registre o pagamento aqui para entrar nas estatísticas.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
