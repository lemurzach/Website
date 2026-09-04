import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);

// Next.js expands "$name" in .env files as a variable reference, which
// silently corrupts bcrypt hashes. Escape every "$" as "\$" so the value
// can be pasted straight into ADMIN_PASSWORD_HASH in your .env file.
const escapedForEnvFile = hash.replaceAll("$", "\\$");

console.log("Bcrypt hash:", hash);
console.log("\nPaste this line into your .env file:");
console.log(`ADMIN_PASSWORD_HASH="${escapedForEnvFile}"`);
