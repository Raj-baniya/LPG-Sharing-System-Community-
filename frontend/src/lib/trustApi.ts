import { getToken, type StoredUser } from "@/lib/trustAuth";
import { API_BASE_URL } from "@/lib/apiBase";

const API_BASE = API_BASE_URL;

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  withAuth?: boolean;
};

export type ProviderDatasetItem = {
  user: {
    id: string;
    name: string;
    role: string;
    isSuspended: boolean;
  };
  trust: TrustSnapshot;
};

export type IdReviewQueueItem = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isSuspended: boolean;
  };
  verification: {
    addressText?: string;
    pinCode?: string;
    isPinVerified?: boolean;
    idDocUrl?: string | null;
    idStatus?: string;
    mobileNumber?: string;
    idType?: string;
    idNumber?: string;
    providerName?: string;
  };
  trustScore: number;
};

export type TrustSnapshot = {
  userId: string;
  role: string;
  isPhoneVerified: boolean;
  verification: {
    addressText?: string;
    pinCode?: string;
    isPinVerified?: boolean;
    idDocUrl?: string | null;
    idStatus?: string;
    mobileNumber?: string;
    idType?: string;
    idNumber?: string;
    providerName?: string;
  };
  metrics: {
    totalExchanges: number;
    successfulExchanges: number;
    safetyChecksCompleted: number;
    disputesCount: number;
    acceptedEmergencyRequests: number;
    avgResponseSeconds: number;
  };
  trustScore: number;
  badges: string[];
};

export type Dispute = {
  id: string;
  exchangeId: string;
  raisedBy: string;
  againstUserId: string;
  reason: string;
  status: string;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  escalationLevel?: number;
};

const toError = async (response: Response) => {
  let message = `Request failed with status ${response.status}`;

  try {
    const data = await response.json();
    if (data?.message) {
      message = data.message;
    }
  } catch {
    // no-op
  }

  throw new Error(message);
};

const api = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.withAuth) {
    const token = getToken();
    if (!token) {
      throw new Error("Please login first");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    await toError(response);
  }

  return response.json() as Promise<T>;
};

export const trustApi = {
  signup: (payload: { name: string; email: string; password: string; role: string }) =>
    api<{ token: string; user: StoredUser; message: string }>("/api/auth/signup", {
      method: "POST",
      body: payload,
    }),

  login: (payload: { email: string; password: string }) =>
    api<{ token: string; user: StoredUser; message: string }>("/api/auth/login", {
      method: "POST",
      body: payload,
    }),

  me: () => api<{ success: boolean; user: StoredUser }>("/api/auth/me", { withAuth: true }),

  getMyTrust: () => api<{ success: boolean; trust: TrustSnapshot }>("/api/trust/me", { withAuth: true }),

  getUserTrust: (userId: string) =>
    api<{ success: boolean; trust: TrustSnapshot }>(`/api/trust/user/${userId}`, { withAuth: true }),

  pinVerify: (payload: { pinCode: string; addressText: string; mobileNumber?: string; providerName?: string }) =>
    api<{ success: boolean; message: string }>("/api/verification/pin-verify", {
      method: "POST",
      withAuth: true,
      body: payload,
    }),

  idUpload: (payload: {
    idDocUrl?: string;
    idType?: "AADHAAR" | "PAN";
    idNumber?: string;
    mobileNumber?: string;
    providerName?: string;
  }) =>
    api<{ success: boolean; message: string }>("/api/verification/id-upload", {
      method: "POST",
      withAuth: true,
      body: payload,
    }),

  idReview: (payload: { userId: string; decision: 'approved' | 'rejected' }) =>
    api<{ success: boolean; message: string; trust: TrustSnapshot }>("/api/verification/id-review", {
      method: "POST",
      withAuth: true,
      body: payload,
    }),

  listIdReviewQueue: () =>
    api<{ success: boolean; count: number; queue: IdReviewQueueItem[] }>("/api/verification/id-review-queue", {
      withAuth: true,
    }),

  listProviders: () =>
    api<{ success: boolean; count: number; providers: ProviderDatasetItem[] }>("/api/trust/providers", {
      withAuth: true,
    }),

  overrideTrust: (userId: string, payload: { trustScore: number; reason?: string }) =>
    api<{ success: boolean; message: string; user: StoredUser; trust: TrustSnapshot }>(`/api/trust/override/${userId}`, {
      method: "PATCH",
      withAuth: true,
      body: payload,
    }),

  listDisputes: () =>
    api<{ success: boolean; count: number; disputes: Dispute[] }>("/api/disputes", {
      withAuth: true,
    }),

  createDispute: (payload: { exchangeId: string; againstUserId: string; reason: string }) =>
    api<{ success: boolean; dispute: Dispute; message: string }>("/api/disputes", {
      method: "POST",
      withAuth: true,
      body: payload,
    }),

  updateDispute: (id: string, payload: { status: string; resolvedBy?: string }) =>
    api<{ success: boolean; dispute: Dispute; message: string }>(`/api/disputes/${id}`, {
      method: "PATCH",
      withAuth: true,
      body: payload,
    }),

  updateSuspension: (userId: string, payload: { suspended: boolean; reason?: string }) =>
    api<{ success: boolean; message: string; user: StoredUser }>(`/api/auth/users/${userId}/suspension`, {
      method: "PATCH",
      withAuth: true,
      body: payload,
    }),

  runDisputeEscalation: () =>
    api<{ success: boolean; message: string; results: unknown }>("/api/internal/run-escalation", {
      method: "POST",
      withAuth: true,
    }),

  listAuditLogs: (limit = 100) =>
    api<{ success: boolean; count: number; logs: Array<Record<string, unknown>> }>(`/api/internal/audit-logs?limit=${limit}`, {
      withAuth: true,
    }),

  getAdminSummary: () =>
    api<{
      success: boolean;
      summary: {
        totalUsers: number;
        totalProviders: number;
        pendingDisputes: number;
        pendingIdReviews: number;
        suspendedUsers: number;
        verifiedProviders: number;
        auditLogCount: number;
      };
      recentAuditLogs: Array<Record<string, unknown>>;
    }>("/api/internal/admin-summary", { withAuth: true }),
};
