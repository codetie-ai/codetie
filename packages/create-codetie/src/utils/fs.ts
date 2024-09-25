import fs from "fs-extra";
import { resolve } from "pathe";

export function exists(path: string) {
  return fs.existsSync(path);
}

export function isEmpty(path: string) {
  return fs.readdirSync(path).length === 0;
}

export function mkDir(path: string) {
  return fs.mkdirSync(path, { recursive: true });
}

export function readDir(path: string) {
  return fs.readdirSync(path, { withFileTypes: true, recursive: true });
}

export function copyDir(src: string, dest: string) {
  mkDir(dest);
  for (const file of fs.readdirSync(src)) {
    const srcFile = resolve(src, file);
    const destFile = resolve(dest, file);
    copy(srcFile, destFile);
  }
}

export function writeFile(path: string, content: string) {
  const destDir = resolve(path, "..");
  fs.ensureDirSync(destDir);
  fs.writeFileSync(path, content);
}

export function copyFile(src: string, dest: string) {
  const destDir = resolve(dest, "..");
  fs.ensureDirSync(destDir);
  fs.copyFileSync(src, dest);
}

export function copy(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    copyFile(src, dest);
  }
}

export function readFile(path: string) {
  return fs.readFileSync(path, "utf-8");
}

export function rename(oldPath: string, newPath: string) {
  return fs.renameSync(oldPath, newPath);
}

export function deleteFile(path: string) {
  return fs.unlinkSync(path);
}

export function deleteDir(path: string) {
  return fs.rmdirSync(path);
}
