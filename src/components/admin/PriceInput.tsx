"use client";

import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: string | number | null | undefined;
  onChange: (raw: string) => void;
};

function toDigits(v: string | number | null | undefined) {
  return String(v ?? "").replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

function format(digits: string) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function PriceInput({ value, onChange, ...rest }: Props) {
  return (
    <input
      {...rest}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={format(toDigits(value))}
      onChange={(e) => onChange(toDigits(e.target.value))}
    />
  );
}