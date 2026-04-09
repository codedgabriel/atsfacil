"use client";

import { KeyboardEvent, useState } from "react";
import clsx from "clsx";

type TagInputProps = {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
};

export function TagInput({ label, tags, onChange, placeholder, suggestions = [], maxTags = 20 }: TagInputProps) {
  const [value, setValue] = useState("");

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
      <label className="mb-1.5 block text-sm font-medium text-gray-800">{label}</label>
      <div className="min-h-12 rounded-lg border border-gray-300 p-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-blue-100">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-brand hover:bg-blue-100"
              aria-label={`Remover ${tag}`}
            >
              {tag} <span aria-hidden="true">x</span>
            </button>
          ))}
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => addTag(value)}
            placeholder={tags.length ? "" : placeholder}
            className="min-w-32 flex-1 border-0 p-1 text-sm outline-none placeholder:text-gray-400"
          />
        </div>
      </div>
      <div className="mt-1.5 text-xs text-gray-500">{tags.length}/{maxTags} habilidades</div>
      {suggestions.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                tags.includes(suggestion) ? "border-blue-100 bg-blue-50 text-brand" : "border-gray-300 text-gray-700 hover:border-brand hover:text-brand",
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
