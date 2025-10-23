import { unlinkSync, existsSync } from "fs";
import { execSync } from "child_process";

const dbPath = process.env.DATABASE_URL || "./data/game.db";

console.log("🗑️  Resetting database...");

// Delete database file if exists
if (existsSync(dbPath)) {
  unlinkSync(dbPath);
  console.log("✅ Database file deleted");
}

// Run migrations
console.log("🔄 Running migrations...");
execSync("npm run db:push", { stdio: "inherit" });

// Run seed
console.log("🌱 Seeding database...");
execSync("npm run db:seed", { stdio: "inherit" });

console.log("✅ Database reset complete!");

