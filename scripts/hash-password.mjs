// Usage: npm run admin:hash -- "your password"
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run admin:hash -- "your password"');
  process.exit(1);
}
if (password.length < 10) {
  console.error("Please use at least 10 characters.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
// Next.js expands "$" in .env files, so every "$" is escaped for .env.local.
console.log(`ADMIN_PASSWORD_HASH=${hash.replaceAll("$", "\\$")}`);
console.log(`\nVercel dashboard value (paste raw):\n${hash}`);
