"use client";

import { ChangeEvent, useId, useRef } from "react";
import { ImagePlus, Trash2, X } from "lucide-react";
import { Button } from "@/components/Button";

type PhotoUploadModalProps = {
  open: boolean;
  templateName: string;
  photoDataUrl: string;
  error: string;
  busy?: boolean;
  onClose: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onConfirm: () => void;
};

export function PhotoUploadModal({
  open,
  templateName,
  photoDataUrl,
  error,
  busy = false,
  onClose,
  onFileChange,
  onRemove,
  onConfirm,
}: PhotoUploadModalProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="photo-modal-title">
      <div className="w-full max-w-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-600">Adicionar foto</p>
            <h2 id="photo-modal-title" className="mt-2 text-2xl font-bold text-slate-950">
              Finalize o modelo {templateName}.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A foto fica salva no navegador para reutilizar nos próximos downloads de impressão.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-500 transition-colors duration-200 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start">
          <div className="flex aspect-[3/4] items-center justify-center overflow-hidden border border-dashed border-slate-300 bg-slate-50">
            {photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoDataUrl} alt="Prévia da foto do currículo" className="h-full w-full object-cover" />
            ) : (
              <div className="px-4 text-center text-sm leading-6 text-slate-500">
                <ImagePlus className="mx-auto h-6 w-6 text-slate-400" aria-hidden="true" />
                <p className="mt-3">Envie uma foto nítida, com o rosto centralizado.</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="border-y border-slate-200 py-4">
              <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={onFileChange}
              />
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
                  {photoDataUrl ? "Trocar foto" : "Selecionar foto"}
                </Button>
                {photoDataUrl ? (
                  <Button type="button" variant="ghost" onClick={onRemove}>
                    <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                    Remover
                  </Button>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                PNG, JPG ou WebP. A imagem é otimizada no navegador antes de ser salva.
              </p>
              {error ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={onClose}>
                Agora não
              </Button>
              <Button type="button" onClick={onConfirm} disabled={busy}>
                {busy ? "Salvando..." : "Salvar foto e continuar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
