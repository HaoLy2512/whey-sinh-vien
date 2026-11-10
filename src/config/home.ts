/** Cấu hình riêng cho trang chủ. */

export const BUDGET_SLIDER = {
  min: 200_000,
  max: 3_000_000,
  step: 100_000,
  default: 1_000_000,
  debounceMs: 400,
} as const;

/** Tab "Theo mục tiêu": id khớp trường Product.goal trong DB */
export const GOAL_LABELS: Record<string, string> = {
  'Muscle Building': 'Tăng cơ',
  Performance: 'Sức mạnh & bùng nổ',
  Recovery: 'Phục hồi',
  'General Nutrition': 'Sức khỏe tổng quát',
};

export function goalLabel(goal: string | null | undefined): string | null {
  if (!goal) return null;
  return GOAL_LABELS[goal] ?? goal;
}
