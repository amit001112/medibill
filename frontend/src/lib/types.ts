import { z } from "zod";

// Frontend-only schemas without drizzle-orm dependencies
export const insertPatientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const insertServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a valid positive number",
  }),
  isActive: z.boolean().default(true),
});

export const insertInvoiceSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  totalAmount: z.number().min(0),
  status: z.enum(["pending", "paid"]).default("pending"),
  items: z.array(z.object({
    serviceId: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0),
  })),
});

export const insertHospitalSettingsSchema = z.object({
  name: z.string().min(1, "Hospital name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  currency: z.string().default("INR"),
  taxRate: z.number().min(0).max(100).default(0),
});

// Types
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertHospitalSettings = z.infer<typeof insertHospitalSettingsSchema>;

export type Patient = InsertPatient & {
  id: string;
  createdAt?: string;
};

export type Service = InsertService & {
  id: string;
  createdAt?: string;
};

export type Invoice = InsertInvoice & {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  patient?: Patient;
  items: InvoiceItem[];
};

export type InvoiceItem = {
  id: string;
  invoiceId: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  service?: Service;
};

export type HospitalSettings = InsertHospitalSettings & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

export type User = {
  id: string;
  username: string;
  name: string;
  role: string;
};