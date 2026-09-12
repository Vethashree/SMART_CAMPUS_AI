import React, { createContext, useContext, useMemo, useState } from 'react';
import type { RequestClassification } from '../../domain/classification/RequestClassification';
import type { Ticket } from '../../domain/tickets/Ticket';

interface SupportRequestState {
  requestText: string;
  studentId: string;
  classification: RequestClassification | null;
  consent: boolean;
  createdTicket: Ticket | null;
  queuedOffline: boolean;
}

interface SupportRequestContextValue extends SupportRequestState {
  setRequestText: (text: string) => void;
  setStudentId: (id: string) => void;
  setClassification: (classification: RequestClassification) => void;
  setConsent: (consent: boolean) => void;
  setCreatedTicket: (ticket: Ticket | null, queuedOffline: boolean) => void;
  reset: () => void;
}

const initialState: SupportRequestState = {
  requestText: '',
  studentId: '',
  classification: null,
  consent: false,
  createdTicket: null,
  queuedOffline: false,
};

const SupportRequestContext = createContext<SupportRequestContextValue | undefined>(undefined);

export function SupportRequestProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SupportRequestState>(initialState);

  const value = useMemo<SupportRequestContextValue>(
    () => ({
      ...state,
      setRequestText: (requestText) => setState((prev) => ({ ...prev, requestText })),
      setStudentId: (studentId) => setState((prev) => ({ ...prev, studentId })),
      setClassification: (classification) => setState((prev) => ({ ...prev, classification })),
      setConsent: (consent) => setState((prev) => ({ ...prev, consent })),
      setCreatedTicket: (createdTicket, queuedOffline) =>
        setState((prev) => ({ ...prev, createdTicket, queuedOffline })),
      reset: () => setState(initialState),
    }),
    [state],
  );

  return <SupportRequestContext.Provider value={value}>{children}</SupportRequestContext.Provider>;
}

export function useSupportRequest(): SupportRequestContextValue {
  const ctx = useContext(SupportRequestContext);
  if (!ctx) throw new Error('useSupportRequest must be used within a SupportRequestProvider');
  return ctx;
}
