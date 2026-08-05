import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { connecterDB } from "@/lib/mongodb";
import Utilisateur from "@/models/Utilisateur";
import bcrypt from "bcryptjs";

/**
 * Seed script to create default admin user on DB initialization.
 * Run this once after DB creation.
 */
export async function seedAdmin() {
  try {
    await connecterDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminName = process.env.ADMIN_NAME || "Administrateur";
    const adminPassword = process.env.ADMIN_PASSWORD || "changeme123";
    
    // Check if admin already exists
    const existingAdmin = await Utilisateur.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return { success: true, message: "Admin already exists" };
    }

    // Hash password
    const hash = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const admin = await Utilisateur.create({
      nom: adminName,
      email: adminEmail,
      motDePasse: hash,
      role: "admin",
    });

    console.log("Admin user created:", admin.email);
    return { success: true, message: "Admin created", user: admin };
  } catch (erreur) {
    console.error("Error seeding admin:", erreur);
    return { success: false, error: erreur };
  }
}

// Auto-run if this file is executed directly
if (require.main === module) {
  seedAdmin().then(() => process.exit(0));
}