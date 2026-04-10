"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";
import { PHOTO_STORAGE_KEY, TEMPLATE_STORAGE_KEY } from "@/lib/printTemplates";

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    const savedTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    const savedPhoto = localStorage.getItem(PHOTO_STORAGE_KEY);

    if (!savedTemplate || !savedPhoto) {
      router.replace("/modelos");
      return;
    }

    router.replace("/download?mode=print");
  }, [router]);

  return (
    <main id="main-content" className="flex h-[100svh] items-center justify-center overflow-hidden bg-white px-5 py-10">
      <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700">
        <Spinner />
        Liberando impressão grátis...
      </div>
    </main>
  );
}
