import React from 'react';

/**
 * TODO(logo thật): khi có file logo SVG đơn sắc, đặt vào public/brands/<slug>.svg
 * rồi khai báo ở BRAND_LOGO_FILES bên dưới. Đến lúc đó component sẽ dùng file thật
 * thay cho chữ cách điệu (wordmark) placeholder.
 */
const BRAND_LOGO_FILES: Record<string, string | undefined> = {
  'optimum-nutrition': undefined, // '/brands/optimum-nutrition.svg'
  dymatize: undefined,
  'rule-1-proteins': undefined,
  muscletech: undefined,
  'applied-nutrition': undefined,
  cellucor: undefined,
};

type WordmarkStyle = { weight: number; spacing: number; italic?: boolean; upper?: boolean };

const WORDMARK_STYLES: Record<string, WordmarkStyle> = {
  'optimum-nutrition': { weight: 800, spacing: 2, upper: true },
  dymatize: { weight: 900, spacing: 3, upper: true },
  'rule-1-proteins': { weight: 800, spacing: 1, upper: false },
  muscletech: { weight: 900, spacing: 1, italic: true, upper: true },
  'applied-nutrition': { weight: 600, spacing: 2, upper: true },
  cellucor: { weight: 700, spacing: 4, upper: true },
};

interface BrandLogoProps {
  name: string;
  slug: string;
  className?: string;
}

/** Logo đơn sắc (currentColor): màu/độ sáng do class cha điều khiển (xám -> sáng khi hover). */
export default function BrandLogo({ name, slug, className = '' }: BrandLogoProps) {
  const file = BRAND_LOGO_FILES[slug];

  if (file) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={file}
        alt={name}
        className={`h-9 w-auto max-w-full object-contain brightness-0 invert ${className}`}
      />
    );
  }

  const style = WORDMARK_STYLES[slug] ?? { weight: 800, spacing: 2, upper: true };
  const label = style.upper === false ? name : name.toUpperCase();
  // Chiều rộng chữ co giãn theo độ dài để không bao giờ tràn khỏi khung
  const textLength = Math.min(176, 14 + label.length * 9);

  return (
    <svg
      viewBox="0 0 200 40"
      role="img"
      aria-label={name}
      className={`h-9 w-full max-w-[200px] ${className}`}
    >
      <text
        x="100"
        y="26"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="var(--font-display), Montserrat, Arial, sans-serif"
        fontSize="17"
        fontWeight={style.weight}
        fontStyle={style.italic ? 'italic' : 'normal'}
        letterSpacing={style.spacing}
        textLength={textLength}
        lengthAdjust="spacingAndGlyphs"
      >
        {label}
      </text>
    </svg>
  );
}
