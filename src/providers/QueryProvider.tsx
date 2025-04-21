'use client'

import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Global default options for queries
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false, // Optional: Disable refetch on window focus
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
} 