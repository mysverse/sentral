interface IndividualTest {
  status: boolean;
  values: {
    pass: any;
    current: any;
  };
  metadata?: any;
  descriptions?: {
    pass: string;
    current: string;
  };
}

export type GrowthEntry = [string, number, boolean?];
export type DateGrowthEntry = [Date, number, boolean?];

type CombinedTestResults = Record<string, IndividualTest>;

export interface DefaultAPIResponse {
  user: {
    userId: number;
    username: string;
    groupMembership?: any;
    hccGamepassOwned?: boolean;
    firearmsGamepassOwned?: boolean;
    exempt: boolean;
  };
  tests: CombinedTestResults;
  history?: StaffDecision[];
}

export interface StaffDecision {
  officer?: number;
  officerName?: string;
  target: {
    id: number;
    name: string | null;
  };
  action: "Grant" | "Refusal";
  correct: boolean;
  data?: DefaultAPIResponse;
  timestamps: {
    action: string;
    review?: string;
  };
}

export interface NametagTemplate {
  name: string;
  category: string;
  type: string;
  variant: number;
  text: {
    font: {
      size: string;
      family: string;
    };
    colour: string;
    anchorPoint: number[];
    maxWidth: number;
  };
  imagePath: string;
}

// Request Type for Creating a Payout
// interface CreatePayoutRequest {
//   userId: number;
//   amount: number;
//   reason: string;
// }

// // Response Type for Create Payout Request
// interface CreatePayoutResponse {
//   success: boolean;
//   message: string;
// }

// // Request Type for Updating Payout Request Status
// interface UpdatePayoutRequestStatus {
//   requestId: number;
//   status: "approved" | "rejected";
// }

// // Response Type for Updating Payout Request Status
// interface UpdatePayoutRequestStatusResponse {
//   success: boolean;
//   message: string;
// }

// Payout Request Data Type
export interface PayoutRequestData {
  id: number;
  user_id: number;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  roblox_group_id: number | null;
  category: string | null;
  approved_by_roblox_user_id: number | null;
  rejection_reason: string | null;
  created_at: Date; // Assuming TIMESTAMP maps to JavaScript Date
  updated_at: Date; // Assuming TIMESTAMP maps to JavaScript Date
}

// Response Type for Fetching Pending Requests
export interface PendingPayoutRequestsResponse {
  requests: PayoutRequestData[];
}
