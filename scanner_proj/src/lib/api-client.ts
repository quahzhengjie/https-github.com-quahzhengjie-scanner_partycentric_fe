/* --------------------------------------------------------------------------
   src/lib/api-client.ts
   Typed client for the Spring-Boot KYC backend
   -------------------------------------------------------------------------- */

   import {
    Case,
    Party,
    Document,
    CreateCaseDto,
    UpdateSubmissionDto,
    User,
    Account,
    ActivityLog,
    ApprovalSnapshot,
    CaseStatus,
    AccountStatus,
    RiskLevel,
    ChecklistSection,
    Submission,
  } from './types';
  
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081/api';
  
  /* ────────────────────────────────────────────────────────────────────────── */
  /* Utilities                                                                 */
  /* ────────────────────────────────────────────────────────────────────────── */
  export class ApiError extends Error {
    constructor(
      public status: number,
      message: string,
      public data?: unknown,
    ) {
      super(message);
      this.name = 'ApiError';
    }
  }
  
  type RequestInterceptor = (c: RequestInit) => RequestInit | Promise<RequestInit>;
  type ResponseInterceptor = (r: Response) => Response | Promise<Response>;
  
  const qs = (p?: Record<string, string | number | boolean | undefined>) =>
    !p
      ? ''
      : `?${Object.entries(p)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
          .join('&')}`;
  
  /* ────────────────────────────────────────────────────────────────────────── */
  /* Core client (interceptors, auto-refresh, JSON parsing)                    */
  /* ────────────────────────────────────────────────────────────────────────── */
  export class ApiClient {
    private static reqInts: RequestInterceptor[] = [];
    private static resInts: ResponseInterceptor[] = [];
  
    /* Register interceptors */
    static addRequestInterceptor(i: RequestInterceptor) {
      this.reqInts.push(i);
    }
    static addResponseInterceptor(i: ResponseInterceptor) {
      this.resInts.push(i);
    }
  
    /* Low-level fetch wrapper */
    private static async fetcher<T>(
      endpoint: string,
      init: RequestInit = {},
      _retry = false,
    ): Promise<T> {
      const url = `${API_BASE_URL}${endpoint}`;
  
      /* 1️⃣  compose cfg */
      let cfg: RequestInit = {
        ...init,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers || {}),
        },
      };
  
      /* 2️⃣  run request interceptors */
      for (const ri of this.reqInts) cfg = await ri(cfg);
  
      /* 3️⃣  fire request */
      let res: Response = await fetch(url, cfg);
  
      /* 4️⃣  run response interceptors */
      for (const rsi of this.resInts) res = await rsi(res);
  
      /* 5️⃣  handle 401 once */
      if (res.status === 401 && !_retry) {
        const fresh = await this.tryRefreshToken();
        if (fresh) {
          const base =
            cfg.headers instanceof Headers
              ? Object.fromEntries(cfg.headers.entries())
              : (cfg.headers as Record<string, string>);
          const retry = await fetch(url, {
            ...cfg,
            headers: { ...base, Authorization: `Bearer ${fresh}` },
          });
          if (!retry.ok) throw await this.toApiError(retry);
          return this.parseJson<T>(retry);
        }
      }
  
      /* 6️⃣  success  */
      if (res.ok) return this.parseJson<T>(res);
  
      /* 7️⃣  failure  */
      throw await this.toApiError(res);
    }
  
    private static async parseJson<T>(r: Response): Promise<T> {
      const text = await r.text();
      return text ? (JSON.parse(text) as T) : ({} as T);
    }
    private static async toApiError(r: Response) {
      const data = await r.json().catch(() => null);
      return new ApiError(r.status, r.statusText, data);
    }
    private static async tryRefreshToken(): Promise<string | null> {
      const refresh = localStorage.getItem('refreshToken');
      if (!refresh) return null;
      try {
        const { accessToken, refreshToken } = await this.fetcher<{
          accessToken: string;
          refreshToken: string;
        }>('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: refresh }),
        });
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        return accessToken;
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        return null;
      }
    }
  
    /* ──────────────────────────────────────────────────────────────────────── */
    /* CASE ENDPOINTS                                                          */
    /* ──────────────────────────────────────────────────────────────────────── */
    static cases = {
      bulkSubmitForReview: (ids: string[]) =>
        this.fetcher<{ succeeded: string[]; failed: string[] }>(
          '/cases/bulk/submit',
          { method: 'POST', body: JSON.stringify({ caseIds: ids }) },
        ),
  
      bulkAssign: (ids: string[], assignedTo: string) =>
        this.fetcher<{ succeeded: string[]; failed: string[] }>(
          '/cases/bulk/assign',
          { method: 'POST', body: JSON.stringify({ caseIds: ids, assignedTo }) },
        ),
  
      getAll: () => this.fetcher<Case[]>('/cases'),
      getById: (id: string) => this.fetcher<Case>(`/cases/${id}`),
  
      create: (dto: CreateCaseDto) =>
        this.fetcher<Case>('/cases', { method: 'POST', body: JSON.stringify(dto) }),
  
      update: (id: string, data: Partial<Case>) =>
        this.fetcher<Case>(`/cases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
      delete: (id: string) => this.fetcher<void>(`/cases/${id}`, { method: 'DELETE' }),
  
      updateStatus: (id: string, status: CaseStatus, reason?: string) =>
        this.fetcher<Case>(`/cases/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ newStatus: status, comments: reason }),
        }),
  
      updateRiskLevel: (id: string, risk: RiskLevel, justification: string) =>
        this.fetcher<Case>(`/cases/${id}/risk`, {
          method: 'PUT',
          body: JSON.stringify({ riskLevel: risk, justification }),
        }),
  
      addSubmission: (caseId: string, reqId: string, data: Omit<Submission, 'submissionId'>) =>
        this.fetcher<Case>(`/cases/${caseId}/documents/${reqId}/submissions`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),
  
      updateSubmission: (
        caseId: string,
        reqId: string,
        subId: string,
        data: UpdateSubmissionDto,
      ) =>
        this.fetcher<Case>(
          `/cases/${caseId}/documents/${reqId}/submissions/${subId}`,
          { method: 'PUT', body: JSON.stringify(data) },
        ),
  
      getChecklist: (caseId: string) =>
        this.fetcher<ChecklistSection[]>(`/cases/${caseId}/checklist`),
  
      proposeAccount: (caseId: string, acc: Omit<Account, 'accountId' | 'accountNumber' | 'status' | 'createdAt' | 'updatedAt'>) =>
        this.fetcher<Case>(`/cases/${caseId}/accounts`, {
          method: 'POST',
          body: JSON.stringify(acc),
        }),
  
      updateAccountStatus: (caseId: string, accId: string, status: AccountStatus, reason?: string) =>
        this.fetcher<Case>(`/cases/${caseId}/accounts/${accId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status, reason }),
        }),
  
      linkParty: (caseId: string, partyId: string, relationshipType: string, ownershipPercentage?: number) =>
        this.fetcher<Case>(`/cases/${caseId}/parties`, {
          method: 'POST',
          body: JSON.stringify({ partyId, relationshipType, ownershipPercentage }),
        }),
  
      unlinkParty: (caseId: string, partyId: string) =>
        this.fetcher<Case>(`/cases/${caseId}/parties/${partyId}`, { method: 'DELETE' }),
  
      getActivities: (caseId: string, opts?: { limit?: number; offset?: number }) =>
        this.fetcher<ActivityLog[]>(`/cases/${caseId}/activities${qs(opts)}`),
  
      createApprovalSnapshot: (caseId: string, type: 'KYC' | 'Account', accountId?: string) =>
        this.fetcher<ApprovalSnapshot>(`/cases/${caseId}/approval-snapshots`, {
          method: 'POST',
          body: JSON.stringify({ snapshotType: type, accountId }),
        }),
  
      search: (query: string, filters?: { status?: CaseStatus; riskLevel?: RiskLevel; assignedTo?: string }) =>
        this.fetcher<Case[]>(`/cases/search${qs({ q: query, ...filters })}`),
    };
  
    /* ──────────────────────────────────────────────────────────────────────── */
    /* PARTY ENDPOINTS                                                         */
    /* ──────────────────────────────────────────────────────────────────────── */
    static parties = {
      getAll: () => this.fetcher<Party[]>('/parties'),
      getById: (id: string) => this.fetcher<Party>(`/parties/${id}`),
  
      create: (data: Omit<Party, 'partyId' | 'createdAt' | 'updatedAt'>) =>
        this.fetcher<Party>('/parties', { method: 'POST', body: JSON.stringify(data) }),
  
      update: (id: string, d: Partial<Party>) =>
        this.fetcher<Party>(`/parties/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  
      delete: (id: string) => this.fetcher<void>(`/parties/${id}`, { method: 'DELETE' }),
  
      getDocuments: (partyId: string) => this.fetcher<Document[]>(`/parties/${partyId}/documents`),
  
      linkDocument: (partyId: string, docId: string) =>
        this.fetcher<Party>(`/parties/${partyId}/documents/${docId}`, { method: 'POST' }),
  
      getCases: (partyId: string) => this.fetcher<Case[]>(`/parties/${partyId}/cases`),
  
      updateRiskProfile: (partyId: string, body: { isPEP: boolean; riskScore: number; riskFactors: string[] }) =>
        this.fetcher<Party>(`/parties/${partyId}/risk-profile`, {
          method: 'PUT',
          body: JSON.stringify(body),
        }),
  
      search: (q: string, f?: { type?: 'Individual' | 'Corporate Entity'; isPEP?: boolean }) =>
        this.fetcher<Party[]>(`/parties/search${qs({ q, ...f })}`),
    };
  
    /* ──────────────────────────────────────────────────────────────────────── */
    /* DOCUMENT ENDPOINTS                                                      */
    /* ──────────────────────────────────────────────────────────────────────── */
    static documents = {
      getAll: () => this.fetcher<Document[]>('/documents'),
      getById: (id: string) => this.fetcher<Document>(`/documents/${id}`),
  
      create: (d: Omit<Document, 'docId'>) =>
        this.fetcher<Document>('/documents', { method: 'POST', body: JSON.stringify(d) }),
  
      update: (id: string, d: Partial<Document>) =>
        this.fetcher<Document>(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  
      delete: (id: string) => this.fetcher<void>(`/documents/${id}`, { method: 'DELETE' }),
  
      upload: async (
        file: File,
        meta: {
          ownerPartyId: string;
          docType: string;
          category: Document['category'];
          issuer?: string;
          issueDate?: string;
          expiryDate?: string;
          documentNumber?: string;
        },
      ) => {
        const fd = new FormData();
        fd.append('file', file);
        Object.entries(meta).forEach(([k, v]) => v && fd.append(k, v));
        const token = localStorage.getItem('authToken');
        const resp = await fetch(`${API_BASE_URL}/documents/upload`, {
          method: 'POST',
          body: fd,
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!resp.ok) throw await this.toApiError(resp);
        return resp.json() as Promise<Document>;
      },
  
      download: (id: string) => {
        const t = localStorage.getItem('authToken');
        window.open(`${API_BASE_URL}/documents/${id}/download?token=${t}`, '_blank');
      },
  
      verify: (id: string, body: { isVerified: boolean; verificationNotes?: string }) =>
        this.fetcher<Document>(`/documents/${id}/verify`, {
          method: 'POST',
          body: JSON.stringify(body),
        }),
  
      downloadBatch: (ids: string[]) => {
        const p = new URLSearchParams();
        ids.forEach((i) => p.append('id', i));
        const t = localStorage.getItem('authToken');
        window.open(`${API_BASE_URL}/documents/download-batch?${p}&token=${t}`, '_blank');
      },
    };
  
    /* ──────────────────────────────────────────────────────────────────────── */
    /* USER ENDPOINTS                                                          */
    /* ──────────────────────────────────────────────────────────────────────── */
    static users = {
      getAll: () => this.fetcher<User[]>('/users'),
      getById: (id: string) => this.fetcher<User>(`/users/${id}`),
      current: () => this.fetcher<User>('/auth/me'),
  
      update: (id: string, d: Partial<User>) =>
        this.fetcher<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  
      login: (cred: { email: string; password: string }) =>
        this.fetcher<{
          accessToken: string;
          refreshToken: string;
          tokenType: string;
          user: User;
        }>('/auth/login', { method: 'POST', body: JSON.stringify(cred) }),
  
      logout: () => this.fetcher<void>('/auth/logout', { method: 'POST' }),
  
      refreshToken: (refresh: string) =>
        this.fetcher<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: refresh }),
        }),
    };
  
    /* ──────────────────────────────────────────────────────────────────────── */
    /* SCAN, ANALYTICS, UTILS                                                  */
    /* ──────────────────────────────────────────────────────────────────────── */
    static scan = {
      initiate: (body: { caseId: string; requirementId: string; docType: string; partyId: string; scanProfile?: string }) =>
        this.fetcher<{ scanId: string; estimatedTime: number }>('/scan/initiate', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
  
      status: (scanId: string) =>
        this.fetcher<{
          status: 'pending' | 'scanning' | 'processing' | 'completed' | 'failed';
          progress?: number;
          documentId?: string;
          error?: string;
        }>(`/scan/status/${scanId}`),
  
      cancel: (scanId: string) => this.fetcher<void>(`/scan/cancel/${scanId}`, { method: 'POST' }),
  
      getProfiles: () =>
        this.fetcher<
          {
            name: string;
            description: string;
            dpi: number;
            colorMode: 'color' | 'grayscale' | 'blackwhite';
            format: 'pdf' | 'jpeg' | 'png';
          }[]
        >('/scan/profiles'),
    };
  
    static analytics = {
      getCaseSummary: (o?: { startDate?: string; endDate?: string; assignedTo?: string }) =>
        this.fetcher<{
          total: number;
          byStatus: Record<CaseStatus, number>;
          byRiskLevel: Record<RiskLevel, number>;
          averageCompletionTime: number;
        }>(`/analytics/cases${qs(o)}`),
  
      getUserPerformance: (userId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') =>
        this.fetcher<{
          casesProcessed: number;
          averageProcessingTime: number;
          approvalRate: number;
          pendingItems: number;
        }>(`/analytics/users/${userId}/performance${qs({ period })}`),
    };
  
    static utils = {
      exportCase: (caseId: string, format: 'pdf' | 'excel' | 'json' = 'pdf') => {
        const t = localStorage.getItem('authToken');
        window.open(`${API_BASE_URL}/cases/${caseId}/export?format=${format}&token=${t}`, '_blank');
      },
  
      bulkUpdateCaseStatus: (ids: string[], status: CaseStatus, reason: string) =>
        ApiClient.fetcher<{ updated: string[]; failed: string[] }>('/cases/bulk/status', {
          method: 'PUT',
          body: JSON.stringify({ caseIds: ids, status, reason }),
        }),
  
      healthCheck: () =>
        ApiClient.fetcher<{ status: 'UP' | 'DEGRADED' | 'DOWN'; service: string; timestamp: string }>('/health'),
    };
  }
  
  /* Attach JWT by default */
  ApiClient.addRequestInterceptor(async (cfg) => {
    const t = localStorage.getItem('authToken');
    return t
      ? { ...cfg, headers: { ...(cfg.headers ?? {}), Authorization: `Bearer ${t}` } }
      : cfg;
  });
  
  /* Convenience helpers for ad-hoc fetches */
  export const getAuthToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  export const setAuthToken = (t: string) =>
    typeof window !== 'undefined' && localStorage.setItem('authToken', t);
  export const removeAuthToken = () =>
    typeof window !== 'undefined' && localStorage.removeItem('authToken');
  export const getAuthHeaders = (): HeadersInit => {
    const t = getAuthToken();
    return t
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }
      : { 'Content-Type': 'application/json' };
  };
  