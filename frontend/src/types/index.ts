export interface PBRContract {
  _id: string;
  contractId: string;
  deviceCount: number;
  batteriesShipped: number;
  threshold: number;
  isLocked: boolean;
  lastUpdated: Date;
  notificationsSent: Array<{
    email: string;
    timestamp: Date;
    message: string;
  }>;
}

export interface ShipmentLog {
  _id: string;
  shipmentId: string;
  contractId: string;
  batteriesShipped: number;
  timestamp: Date;
  status: 'APPROVED' | 'BLOCKED' | 'PENDING';
  initiatedBy: string;
}

export interface User {
  _id: string;
  email: string;
  role: 'user' | 'admin';
  token: string;
}

export interface DashboardStats {
  totalContracts: number;
  activeShipments: number;
  blockedContracts: number;
  alertsToday: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}