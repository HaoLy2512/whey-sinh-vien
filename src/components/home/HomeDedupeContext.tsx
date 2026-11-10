'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

interface HomeDedupeValue {
  /** id sản phẩm đang hiện ở Hero + Best Sellers (từ server) */
  baseExcludeIds: string[];
  /** id đang hiện ở section "Theo mục tiêu"; null = chưa tải xong */
  goalIds: string[] | null;
  setGoalIds: (ids: string[] | null) => void;
}

const HomeDedupeContext = createContext<HomeDedupeValue>({
  baseExcludeIds: [],
  goalIds: [],
  setGoalIds: () => {},
});

export function HomeDedupeProvider({
  baseExcludeIds,
  children,
}: {
  baseExcludeIds: string[];
  children: React.ReactNode;
}) {
  const [goalIds, setGoalIds] = useState<string[] | null>(null);
  const value = useMemo(
    () => ({ baseExcludeIds, goalIds, setGoalIds }),
    [baseExcludeIds, goalIds]
  );
  return <HomeDedupeContext.Provider value={value}>{children}</HomeDedupeContext.Provider>;
}

export function useHomeDedupe() {
  return useContext(HomeDedupeContext);
}
