#!/usr/bin/env node
// Seal a cashflow JSON file with OPEN_PASSWORD for GitHub Pages.
// Usage: OPEN_PASSWORD=... node scripts/seal-cashflow.mjs path/to/cashflow.json [out]
import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const password = process.env.OPEN_PASSWORD || "";
const input = process.argv[2];
const output = process.argv[3] || "cashflow.enc.json";
if (!password) {
  console.error("OPEN_PASSWORD is required");
  process.exit(1);
}
if (!input) {
  console.error("usage: node scripts/seal-cashflow.mjs <cashflow.json> [cashflow.enc.json]");
  process.exit(1);
}

const iterations = 210000;
const salt = randomBytes(16);
const iv = randomBytes(12);
const key = pbkdf2Sync(password, salt, iterations, 32, "sha256");
const cipher = createCipheriv("aes-256-gcm", key, iv);
const plaintext = readFileSync(input);
const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()]);
const payload = {
  v: 1,
  kdf: "PBKDF2-SHA256",
  iterations,
  salt: salt.toString("base64"),
  iv: iv.toString("base64"),
  ciphertext: ciphertext.toString("base64")
};
writeFileSync(output, JSON.stringify(payload));
console.log(`sealed ${plaintext.length} bytes -> ${output} (${Buffer.byteLength(JSON.stringify(payload))} bytes)`);
