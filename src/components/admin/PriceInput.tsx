"use client";

import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: string | number | null | undefined;
  onChange: (raw: string) => void;
};

// Chuẩn hóa giá trị đang lưu trong state: bỏ phần thập phân, giữ số nguyên
function normalize(v: string | number | null | undefined) {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "number") return String(Math.round(v));
  if (/^\d+\.\d+$/.test(v)) return String(Math.round(parseFloat(v)));
  return v.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

// Chuẩn hóa chữ người dùng đang gõ (đã có dấu chấm phân cách)
function toDigits(v: string) {
  return v.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
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
      value={format(normalize(value))}
      onChange={(e) => onChange(toDigits(e.target.value))}
    />
  );
}