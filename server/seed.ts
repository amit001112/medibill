import { db } from "./db";
import { users, patients, services, invoices, invoiceItems, hospitalSettings } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Check if admin user already exists
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.username, "admin"))
      .limit(1);

    if (!existingAdmin) {
      // Create default admin user
      await db.insert(users).values({
        username: "admin",
        password: "admin123",
        name: "Administrator",
        role: "admin"
      });
      console.log("✅ Admin user created: admin/admin123");
    } else {
      console.log("ℹ️ Admin user already exists");
    }

    // Check if patients already exist
    const existingPatients = await db.select().from(patients).limit(1);
    
    if (existingPatients.length === 0) {
      // Create sample patients
      const samplePatients = [
        {
          name: "Sarah Johnson",
          email: "sarah.johnson@email.com",
          phone: "+91-9876543210",
          address: "123 Main Street, Mumbai, Maharashtra, India",
          dateOfBirth: "1985-06-15",
          status: "active"
        },
        {
          name: "Michael Davis",
          email: "michael.davis@email.com",
          phone: "+91-9876543211",
          address: "456 Oak Avenue, Delhi, India",
          dateOfBirth: "1978-03-22",
          status: "active"
        },
        {
          name: "John Smith",
          email: "john.smith@email.com",
          phone: "+91-9876543212",
          address: "789 Pine Road, Bangalore, Karnataka, India",
          dateOfBirth: "1992-11-08",
          status: "active"
        }
      ];

      const createdPatients = await db.insert(patients).values(samplePatients).returning();
      console.log(`✅ ${createdPatients.length} sample patients created`);
    } else {
      console.log("ℹ️ Patients already exist");
    }

    // Create sample services
    const sampleServices = [
      {
        name: "General Consultation",
        description: "Standard medical consultation with primary care physician",
        category: "consultation",
        price: "150.00",
        isActive: true
      },
      {
        name: "Blood Test",
        description: "Complete blood count and basic metabolic panel",
        category: "diagnostic",
        price: "85.00",
        isActive: true
      },
      {
        name: "X-Ray Chest",
        description: "Chest X-ray imaging",
        category: "diagnostic",
        price: "120.00",
        isActive: true
      },
      {
        name: "Physical Therapy Session",
        description: "One hour physical therapy session",
        category: "treatment",
        price: "95.00",
        isActive: true
      }
    ];

    const createdServices = await db.insert(services).values(sampleServices).returning();

    // Create sample invoices
    const sampleInvoices = [
      {
        invoiceNumber: "INV-2024-001",
        patientId: createdPatients[0].id,
        invoiceDate: "2024-01-15",
        dueDate: "2024-02-15",
        subtotal: "235.00",
        taxRate: "8.5",
        taxAmount: "19.98",
        total: "254.98",
        status: "pending"
      },
      {
        invoiceNumber: "INV-2024-002",
        patientId: createdPatients[1].id,
        invoiceDate: "2024-01-16",
        dueDate: "2024-02-16",
        subtotal: "150.00",
        taxRate: "8.5",
        taxAmount: "12.75",
        total: "162.75",
        status: "paid"
      }
    ];

    const createdInvoices = await db.insert(invoices).values(sampleInvoices).returning();

    // Create invoice items
    const sampleInvoiceItems = [
      {
        invoiceId: createdInvoices[0].id,
        serviceId: createdServices[0].id,
        serviceName: "General Consultation",
        quantity: 1,
        unitPrice: "150.00",
        total: "150.00"
      },
      {
        invoiceId: createdInvoices[0].id,
        serviceId: createdServices[1].id,
        serviceName: "Blood Test",
        quantity: 1,
        unitPrice: "85.00",
        total: "85.00"
      },
      {
        invoiceId: createdInvoices[1].id,
        serviceId: createdServices[0].id,
        serviceName: "General Consultation",
        quantity: 1,
        unitPrice: "150.00",
        total: "150.00"
      }
    ];

    await db.insert(invoiceItems).values(sampleInvoiceItems);

    // Check if hospital settings exist
    const existingSettings = await db.select().from(hospitalSettings).limit(1);
    
    if (existingSettings.length === 0) {
      // Create default hospital settings
      await db.insert(hospitalSettings).values({
        name: "City General Hospital",
        address: "123 Medical Street, Mumbai, Maharashtra 400001, India",
        phone: "+91-22-12345678",
        email: "info@citygeneralhospital.com",
        logoUrl: null,
        currency: "INR",
        taxRate: "18.00"
      });
      console.log("✅ Hospital settings created with INR currency");
    } else {
      console.log("ℹ️ Hospital settings already exist");
    }

    console.log("Database seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };