import { db } from "./db";
import { users, patients, services, invoices, invoiceItems, hospitalSettings } from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Create default admin user
    await db.insert(users).values({
      username: "admin",
      password: "admin123",
      name: "Administrator",
      role: "admin"
    }).onConflictDoNothing();

    // Create sample patients
    const samplePatients = [
      {
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "+1-555-0123",
        address: "123 Main St, City, State 12345",
        dateOfBirth: "1980-05-15",
        status: "active"
      },
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1-555-0124",
        address: "456 Oak Ave, City, State 12345",
        dateOfBirth: "1975-08-22",
        status: "active"
      },
      {
        name: "Michael Davis",
        email: "michael.davis@email.com",
        phone: "+1-555-0125",
        address: "789 Pine St, City, State 12345",
        dateOfBirth: "1992-12-03",
        status: "active"
      }
    ];

    const createdPatients = await db.insert(patients).values(samplePatients).returning();

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

    // Create default hospital settings
    await db.insert(hospitalSettings).values({
      name: "City General Hospital",
      address: "123 Healthcare Ave, Medical City, MC 12345",
      phone: "+1-555-0199",
      email: "admin@cityhospital.com",
      logoUrl: null,
      currency: "USD",
      taxRate: "8.5"
    }).onConflictDoNothing();

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