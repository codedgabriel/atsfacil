"use client";

import Link from "next/link";
import { Button } from "@/components/Button";

export default function ErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-brand">Algo saiu do fluxo</p>
        <h1 className="mt-3 text-3xl font-bold text-gray-950">Não conseguimos carregar esta página.</h1>
        <p className="mt-4 text-gray-600">Tente novamente em instantes. Seus dados ficam salvos neste navegador.</p>
        <Button asChild className="mt-8">
          <Link href="/">Voltar para o início</Link>
        </Button>
      </div>
    </main>
  );
}
