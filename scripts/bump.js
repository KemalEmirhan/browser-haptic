/**
 * Bump package.json version (patch | minor | major).
 * Usage: node scripts/bump.js [patch|minor|major]
 */
const fs = require("fs");
const path = require("path");

const pkgPath = path.join(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const part = process.argv[2] || "patch";

const [major, minor, patch] = pkg.version.split(".").map(Number);
if (part === "major") {
  pkg.version = `${major + 1}.0.0`;
} else if (part === "minor") {
  pkg.version = `${major}.${minor + 1}.0`;
} else {
  pkg.version = `${major}.${minor}.${patch + 1}`;
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log("Version bumped to", pkg.version);
