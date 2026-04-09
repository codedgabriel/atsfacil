import Link from "next/link";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-brand">404</p>
        <h1 className="mt-3 text-3xl font-bold text-gray-950">Página não encontrada</h1>
        <p className="mt-4 text-gray-600">Esse caminho não existe no ATSFácil.</p>
        <Button asChild className="mt-8">
          <Link href="/">Ir para o início</Link>
        </Button>
      </div>
    </main>
  );
}
