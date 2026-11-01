/**
 * Secure Admin Setup Script
 * Use this command-line utility to initialize or promote an administrator account.
 *
 * Usage:
 *   node scripts/createAdmin.js <email> <password> [fullName]
 *
 * Example:
 *   node scripts/createAdmin.js admin@campusx.edu AdminSecurePass2026 "Campus Super Admin"
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function run() {
  const args = process.argv.slice(2);
  const email = (args[0] || "").trim().toLowerCase();
  const password = args[1] || "";
  const name = (args[2] || "System Administrator").trim();

  if (!email || !password) {
    console.error("\n❌ Error: Missing required arguments.");
    console.log("Usage: node scripts/createAdmin.js <email> <password> [fullName]\n");
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("\n❌ Error: Password must be at least 6 characters long.\n");
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error("\n❌ Error: MONGO_URI not found in server/.env\n");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    console.log("Connected to database successfully.");

    let user = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      user.role = "admin";
      user.password = hashedPassword;
      if (name && name !== "System Administrator") user.name = name;
      await user.save();
      console.log(`\n✅ Success: Existing account (${email}) has been elevated to Administrator role!`);
    } else {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        collegeId: "ADMIN-001",
        branch: "Campus Administration",
        semester: 1,
        role: "admin",
      });
      console.log(`\n✅ Success: New Administrator account created successfully!`);
    }

    console.log(`Email: ${user.email}`);
    console.log(`Role:  ${user.role}`);
    console.log(`Name:  ${user.name}\n`);
    console.log("You can now sign in with these credentials at http://localhost:4028/\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Setup error:", err.message);
    process.exit(1);
  }
}

run();

