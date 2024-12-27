export interface Contract {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: "draft" | "pending" | "signed" | "expired";
  clientEmail?: string;
  clientPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "closed" | "lost";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  companyName: string;
  subscriptionStatus: "free" | "basic" | "premium";
  contracts: Contract[];
  leads: Lead[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  userId: string;
  leadId?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  attendees: string[];
  location?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}
