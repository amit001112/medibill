import { 
  users,
  patients,
  services,
  invoices,
  invoiceItems,
  hospitalSettings,
  type User, 
  type InsertUser,
  type Patient,
  type InsertPatient,
  type Service,
  type InsertService,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type HospitalSettings,
  type InsertHospitalSettings,
  type InvoiceWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Patients
  getPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: string): Promise<boolean>;

  // Services
  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;

  // Invoices
  getInvoices(): Promise<InvoiceWithDetails[]>;
  getInvoice(id: string): Promise<InvoiceWithDetails | undefined>;
  createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<InvoiceWithDetails>;
  updateInvoiceStatus(id: string, status: string): Promise<boolean>;
  deleteInvoice(id: string): Promise<boolean>;

  // Hospital Settings
  getHospitalSettings(): Promise<HospitalSettings | undefined>;
  updateHospitalSettings(settings: InsertHospitalSettings): Promise<HospitalSettings>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    totalPatients: number;
    totalInvoices: number;
    monthlyRevenue: number;
    pendingBills: number;
  }>;
}

class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients).orderBy(patients.createdAt);
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db
      .insert(patients)
      .values(patient)
      .returning();
    return newPatient;
  }

  async updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [updatedPatient] = await db
      .update(patients)
      .set(patient)
      .where(eq(patients.id, id))
      .returning();
    return updatedPatient || undefined;
  }

  async deletePatient(id: string): Promise<boolean> {
    const result = await db.delete(patients).where(eq(patients.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(services.createdAt);
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db
      .insert(services)
      .values(service)
      .returning();
    return newService;
  }

  async updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updatedService || undefined;
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getInvoices(): Promise<InvoiceWithDetails[]> {
    const invoicesWithPatients = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        patientId: invoices.patientId,
        invoiceDate: invoices.invoiceDate,
        dueDate: invoices.dueDate,
        subtotal: invoices.subtotal,
        taxRate: invoices.taxRate,
        taxAmount: invoices.taxAmount,
        total: invoices.total,
        status: invoices.status,
        createdAt: invoices.createdAt,
        patient: {
          id: patients.id,
          name: patients.name,
          email: patients.email,
          phone: patients.phone,
          address: patients.address,
          dateOfBirth: patients.dateOfBirth,
          status: patients.status,
          createdAt: patients.createdAt,
        }
      })
      .from(invoices)
      .leftJoin(patients, eq(invoices.patientId, patients.id))
      .orderBy(invoices.createdAt);

    const result: InvoiceWithDetails[] = [];
    for (const invoice of invoicesWithPatients) {
      const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoice.id));
      result.push({
        ...invoice,
        patient: invoice.patient!,
        items
      });
    }

    return result;
  }

  async getInvoice(id: string): Promise<InvoiceWithDetails | undefined> {
    const [invoice] = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        patientId: invoices.patientId,
        invoiceDate: invoices.invoiceDate,
        dueDate: invoices.dueDate,
        subtotal: invoices.subtotal,
        taxRate: invoices.taxRate,
        taxAmount: invoices.taxAmount,
        total: invoices.total,
        status: invoices.status,
        createdAt: invoices.createdAt,
        patient: {
          id: patients.id,
          name: patients.name,
          email: patients.email,
          phone: patients.phone,
          address: patients.address,
          dateOfBirth: patients.dateOfBirth,
          status: patients.status,
          createdAt: patients.createdAt,
        }
      })
      .from(invoices)
      .leftJoin(patients, eq(invoices.patientId, patients.id))
      .where(eq(invoices.id, id));

    if (!invoice) return undefined;

    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    
    return {
      ...invoice,
      patient: invoice.patient!,
      items
    };
  }

  async createInvoice(insertInvoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<InvoiceWithDetails> {
    const [invoice] = await db
      .insert(invoices)
      .values(insertInvoice)
      .returning();

    const invoiceItemsWithIds = items.map(item => ({
      ...item,
      invoiceId: invoice.id
    }));

    const createdItems = await db
      .insert(invoiceItems)
      .values(invoiceItemsWithIds)
      .returning();

    const [patient] = await db.select().from(patients).where(eq(patients.id, invoice.patientId));
    
    return {
      ...invoice,
      patient: patient!,
      items: createdItems
    };
  }

  async updateInvoiceStatus(id: string, status: string): Promise<boolean> {
    const result = await db
      .update(invoices)
      .set({ status })
      .where(eq(invoices.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getHospitalSettings(): Promise<HospitalSettings | undefined> {
    const [settings] = await db.select().from(hospitalSettings).limit(1);
    return settings || undefined;
  }

  async updateHospitalSettings(settings: InsertHospitalSettings): Promise<HospitalSettings> {
    const existingSettings = await this.getHospitalSettings();
    
    if (existingSettings) {
      const [updated] = await db
        .update(hospitalSettings)
        .set({ ...settings, updatedAt: sql`NOW()` })
        .where(eq(hospitalSettings.id, existingSettings.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(hospitalSettings)
        .values(settings)
        .returning();
      return created;
    }
  }

  async getDashboardStats(): Promise<{
    totalPatients: number;
    totalInvoices: number;
    monthlyRevenue: number;
    pendingBills: number;
  }> {
    const [totalPatientsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(patients);

    const [totalInvoicesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices);

    const [monthlyRevenueResult] = await db
      .select({ 
        revenue: sql<number>`COALESCE(SUM(CAST(${invoices.total} AS DECIMAL)), 0)` 
      })
      .from(invoices)
      .where(sql`EXTRACT(MONTH FROM ${invoices.createdAt}) = EXTRACT(MONTH FROM NOW())
                 AND EXTRACT(YEAR FROM ${invoices.createdAt}) = EXTRACT(YEAR FROM NOW())`);

    const [pendingBillsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(eq(invoices.status, "pending"));

    return {
      totalPatients: totalPatientsResult.count,
      totalInvoices: totalInvoicesResult.count,
      monthlyRevenue: monthlyRevenueResult.revenue,
      pendingBills: pendingBillsResult.count,
    };
  }
}

export const storage = new DatabaseStorage();