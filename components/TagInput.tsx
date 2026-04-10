"use client";

import { KeyboardEvent, useState } from "react";
import clsx from "clsx";
import { HelpTip } from "@/components/HelpTip";

type TagInputProps = {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
  helpTip?: string;
};

export function TagInput({ label, tags, onChange, placeholder, suggestions = [], maxTags = 20, helpTip }: TagInputProps) {
  const [value, setValue] = useState("");
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  function addTag(raw: string) {
    const tag = raw.trim().replace(/,$/, "");
    if (!tag || tags.includes(tag) || tags.length >= maxTags) return;
    onChange([...tags, tag]);
    setValue("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(value);
    }
  }

  function removeTag(tag: string) {
    onChange(tags.filter((item) => item !== tag));
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          {label}
        </label>
        {helpTip ? <HelpTip label={label}>{helpTip}</HelpTip> : null}
      </div>
      <div className="border-b border-slate-300 pb-3 transition-colors duration-200 focus-within:border-brand">
        <div className="flex min-w-0 flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              className="max-w-full break-words rounded-full border border-slate-300 px-3 py-1 text-left text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
              aria-label={`Remover ${tag}`}
            >
              {tag} <span aria-hidden="true">x</span>
            </button>
          ))}
          <input
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => addTag(value)}
            placeholder={tags.length ? "" : placeholder}
            className="min-w-[12rem] flex-1 border-0 bg-transparent px-0 py-1 text-sm text-slate-950 outline-none placeholder:text-slate-400"
            autoComplete="off"
          />
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-500 tabular-nums">{tags.length}/{maxTags} habilidades</div>
      {suggestions.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className={clsx(
                "max-w-full break-words rounded-full border px-3 py-1.5 text-left text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100",
                tags.includes(suggestion) ? "border-blue-200 bg-blue-50 text-brand" : "border-slate-300 text-slate-600 hover:border-brand hover:text-brand",
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
