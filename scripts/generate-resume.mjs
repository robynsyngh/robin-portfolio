import fs from "fs";
import path from "path";

const root = process.cwd();
const source = path.join(root, "content/resume.pdf");
const target = path.join(root, "public/resume.pdf");

if (!fs.existsSync(source)) {
  console.error("Missing content/resume.pdf. Place your resume PDF there first.");
  process.exit(1);
}

fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.copyFileSync(source, target);
console.log(`Synced resume.pdf → public/resume.pdf (${fs.statSync(target).size} bytes)`);
