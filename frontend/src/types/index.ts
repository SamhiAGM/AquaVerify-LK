export type Role = 'ADMIN' | 'OFFICER' | 'LAB_TECHNICIAN' | 'CITIZEN';

export type ComplaintStatus =
  | 'PENDING'
  | 'UNDER_INVESTIGATION'
  | 'TESTING_REQUESTED'
  | 'RESOLVED'
  | 'REJECTED';

export type ComplaintCategory =
  | 'ODOR'
  | 'TASTE'
  | 'COLOR_DISCOLORATION'
  | 'SUSPECTED_CONTAMINATION'
  | 'SEDIMENT'
  | 'PIPE_CORROSION'
  | 'OTHER';

export type WaterSourceType =
  | 'TAP_LINE'
  | 'SHALLOW_WELL'
  | 'DEEP_TUBE_WELL'
  | 'COMMUNITY_TANK'
  | 'NATURAL_SPRING'
  | 'RIVER_RESERVOIR'
  | 'RAINWATER_HARVEST';

export type VerificationStatus =
  | 'DRAFT'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'REJECTED';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  district: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface WaterSource {
  id: number;
  sourceName: string;
  sourceType: WaterSourceType;
  district: string;
  locationDescription: string;
  latitude?: number | null;
  longitude?: number | null;
  activeComplaintsCount?: number;
  verifiedTestsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Complaint {
  id: number;
  complaintReference: string;
  citizen: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    district: string;
  };
  waterSource?: {
    id: number;
    sourceName: string;
    sourceType: WaterSourceType;
    district: string;
  } | null;
  assignedOfficer?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
  } | null;
  title: string;
  description: string;
  complaintCategory: ComplaintCategory;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

export interface ComplaintUpdate {
  id: number;
  complaintId: number;
  updatedBy: {
    id: number;
    fullName: string;
    role: Role;
  };
  previousStatus: string;
  newStatus: string;
  note: string;
  createdAt: string;
}

export interface ComplaintDetail {
  complaint: Complaint;
  timeline: ComplaintUpdate[];
  relatedTests: WaterTest[];
}

export interface WaterTest {
  id: number;
  waterSourceId: number;
  waterSourceName: string;
  district: string;
  laboratoryTechnicianId: number;
  laboratoryTechnicianName: string;
  sampleDate: string;
  phValue: number;
  turbidityNtu: number;
  tdsPpm?: number | null;
  conductivityUsCm?: number | null;
  nitrateMgL?: number | null;
  eColiPresence?: boolean | null;
  laboratoryReference: string;
  verificationStatus: VerificationStatus;
  verifiedById?: number | null;
  verifiedByName?: string | null;
  verifiedAt?: string | null;
  withinStandard: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CitizenDashboard {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  recentComplaints: Complaint[];
  nearbyPublishedTests: WaterTest[];
}

export interface OfficerDashboard {
  assignedComplaints: number;
  pendingReviews: number;
  underInvestigation: number;
  resolvedCases: number;
  complaintsByCategory: Record<string, number>;
  recentAssignedComplaints: Complaint[];
}

export interface LabDashboard {
  totalSamples: number;
  pendingTests: number;
  verifiedTests: number;
  rejectedTests: number;
  testTrends: Record<string, number>;
  recentRecords: WaterTest[];
}

export interface AdminDashboard {
  registeredUsers: number;
  totalComplaints: number;
  activeComplaints: number;
  resolvedComplaints: number;
  totalWaterSources: number;
  totalTestsRecorded: number;
  complaintsByDistrict: Record<string, number>;
  recentComplaints: Complaint[];
  recentAuditLogs: AuditLog[];
}

export interface PublicStats {
  totalComplaints: number;
  resolvedComplaints: number;
  waterTestsRecorded: number;
  monitoredWaterSources: number;
  resolutionRate: number;
}

export interface AuditLog {
  id: number;
  actor?: {
    id: number;
    fullName: string;
    role: Role;
  } | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string> | null;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
