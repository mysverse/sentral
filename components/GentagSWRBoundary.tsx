"use client";

import { SWRConfig } from "swr";
import { GENTAG_TEMPLATES_KEY } from "lib/readKeys";

class LruMap<Value> extends Map<string, Value> {
  constructor(private readonly maxEntries: number) {
    super();
  }

  override get(key: string) {
    const value = super.get(key);
    if (typeof value !== "undefined") {
      super.delete(key);
      super.set(key, value);
    }
    return value;
  }

  override set(key: string, value: Value) {
    if (super.has(key)) {
      super.delete(key);
    } else if (this.size >= this.maxEntries) {
      const oldest = this.keys().next().value;
      if (typeof oldest === "string") {
        super.delete(oldest);
      }
    }
    return super.set(key, value);
  }
}

export default function GentagSWRBoundary({
  templates,
  children
}: {
  templates: unknown;
  children: React.ReactNode;
}) {
  return (
    <SWRConfig
      value={{
        provider: () => new LruMap(20),
        fallback: { [GENTAG_TEMPLATES_KEY]: templates }
      }}
    >
      {children}
    </SWRConfig>
  );
}
