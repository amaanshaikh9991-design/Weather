export type DisasterSeverity =
  | "low"
  | "moderate"
  | "high"
  | "extreme";

export interface DisasterAlert {
  id: string;

  type: string;

  title: string;

  severity: DisasterSeverity;

  latitude: number;

  longitude: number;

  affectedArea: string;

  issuedAt: string;

  expiresAt?: string;

  source: string;

  sourceUrl?: string;

  description?: string;
}