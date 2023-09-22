export interface IndividualTest {
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

export type CombinedTestResults = Record<string, IndividualTest>;
export interface ApiSessionStats {
  requestCounter: {
    valid: number;
  };
  sessionStart: string;
}

export interface DefaultAPIResponse {
  user: {
    userId: number;
    username: string;
    groupMembership?: any;
    hccGamepassOwned?: boolean;
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

export interface BlacklistItem {
  id: number;
  reason?: string;
  name?: string;
}
