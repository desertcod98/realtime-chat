"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
    },
  },
})

export const ReactQueryContext = ({children}: {children: ReactNode}) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}