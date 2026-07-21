"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { completeTour } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    selector: '[data-tour="/dashboard"]',
    title: "Dashboard",
    description:
      "Sua visão geral: ganhos do mês, próximos agendamentos e prazos no radar.",
  },
  {
    selector: '[data-tour="/dashboard/agenda"]',
    title: "Agenda",
    description:
      "O calendário dos seus projetos agendados, mês a mês.",
  },
  {
    selector: '[data-tour="/dashboard/projetos"]',
    title: "Projetos",
    description:
      "O mural de trabalho: crie projetos com preço calculado e acompanhe as TO-DO lists até a entrega.",
  },
  {
    selector: '[data-tour="/dashboard/financeiro"]',
    title: "Financeiro",
    description:
      "Registre pagamentos e veja seus ganhos por dia, semana, mês e ano.",
  },
  {
    selector: '[data-tour="/dashboard/clientes"]',
    title: "Clientes",
    description:
      "Quem contrata você: contatos, notas e o histórico de projetos de cada um.",
  },
  {
    selector: '[data-tour="/dashboard/servicos"]',
    title: "Serviços",
    description:
      "O que você oferece, com preço base e fatores multiplicativos (urgência, complexidade...). Comece por aqui! 😉",
  },
  {
    selector: '[data-tour="/dashboard/configuracoes"]',
    title: "Configurações",
    description:
      "Tema, fonte, acessibilidade e notificações — e onde você reabre este tour.",
  },
];

export function InterfaceTour({ show }: { show: boolean }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Só no desktop: no mobile a sidebar não fica visível para ancorar o tour
    if (show && window.matchMedia("(min-width: 768px)").matches) {
      setActive(true);
    }
  }, [show]);

  useEffect(() => {
    if (!active) return;
    const element = document.querySelector(STEPS[step].selector);
    if (!element) {
      setRect(null);
      return;
    }
    const update = () => setRect(element.getBoundingClientRect());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [active, step]);

  const finish = useCallback(() => {
    setActive(false);
    startTransition(async () => {
      await completeTour();
    });
  }, [startTransition]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, finish]);

  if (!active || !rect) return null;

  const isLast = step === STEPS.length - 1;
  const popoverTop = Math.min(rect.top, window.innerHeight - 240);

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-label="Tour pela interface"
    >
      {/* Recorte de destaque: a sombra gigante escurece todo o resto */}
      <div
        className="absolute rounded-lg ring-2 ring-primary transition-all duration-200"
        style={{
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
        }}
        aria-hidden
      />
      <div
        className="absolute w-80 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg"
        style={{ left: rect.right + 16, top: popoverTop }}
      >
        <p className="text-xs font-medium text-muted-foreground">
          Passo {step + 1} de {STEPS.length}
        </p>
        <h2 className="mt-1 font-semibold">{STEPS[step].title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {STEPS[step].description}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={finish}>
            Pular tour
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
              >
                Anterior
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => (isLast ? finish() : setStep(step + 1))}
            >
              {isLast ? "Concluir" : "Próximo"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
