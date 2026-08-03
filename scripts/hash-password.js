import { hashPassword } from "../lib/auth.js";

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run hash-password -- <your-password>");
  process.exit(1);
}

console.log("\nAdd this to your environment variables as PASSWORD_HASH:\n");
console.log(hashPassword(password));
console.log("\nDo not commit this value or the plaintext password to git.\n");
