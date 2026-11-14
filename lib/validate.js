// Central input validation. Everything that comes from the client is treated as hostile.
export class UserError extends Error {
  constructor(message, status = 400, code) { super(message); this.status = status; this.code = code; }
}

export const LANGS = ["English", "Somali", "Arabic", "French", "Spanish", "Swahili", "Turkish", "Chinese", "Hindi", "Portuguese", "German", "Russian"];
export const MAX_FILE_BYTES = 15 * 1024 * 1024;
export const MAX_FILES = 5;
export const MAX_TOTAL_BYTES = 30 * 1024 * 1024;
export const ALLOWED_EXT = [".pdf", ".docx", ".pptx", ".txt", ".md"];

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Must be a real string (blocks NoSQL operator objects like {"$ne": ""}), trimmed, control chars removed, length-bounded. */
export function str(v, { name = "Field", min = 0, max = 1000, required = true } = {}) {
  if (v === undefined || v === null || v === "") {
    if (required && min > 0) throw new UserError(`${name} is required.`);
    return "";
  }
  if (typeof v !== "string") throw new UserError(`${name} is invalid.`);
  const s = v.replace(CONTROL, "").trim();
  if (s.length < min) throw new UserError(`${name} is too short.`);
  if (s.length > max) throw new UserError(`${name} is too long (max ${max} characters).`);
  return s;
}

export const isId = (v) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);
export function id(v, name = "ID") {
  if (!isId(v)) throw new UserError(`${name} is invalid.`, 400);
  return v;
}

export function email(v) {
  const s = str(v, { name: "Email", min: 3, max: 254 }).toLowerCase();
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(s)) throw new UserError("Enter a valid email address.");
  return s;
}

export function password(v) {
  if (typeof v !== "string") throw new UserError("Password is invalid.");
  if (v.length < 10) throw new UserError("Password must be at least 10 characters.");
  if (v.length > 72) throw new UserError("Password must be 72 characters or fewer.");
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) throw new UserError("Password must include letters and numbers.");
  return v;
}

export function language(v) {
  const s = str(v || "English", { name: "Language", max: 30 });
  if (!LANGS.includes(s)) throw new UserError("Unsupported language.");
  return s;
}

export function slug(v) {
  const s = str(v, { name: "Template", min: 1, max: 60 });
  if (!/^[a-z0-9-]+$/.test(s)) throw new UserError("Template is invalid.");
  return s;
}

export function checkFiles(files) {
  if (files.length > MAX_FILES) throw new UserError(`Upload at most ${MAX_FILES} files.`);
  let total = 0;
  for (const f of files) {
    if (typeof f === "string" || typeof f.arrayBuffer !== "function") throw new UserError("Invalid file upload.");
    const ext = (f.name.match(/\.[^.]+$/) || [""])[0].toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) throw new UserError(`${f.name.slice(0, 80)} is not supported. Use PDF, DOCX, PPTX, TXT or MD.`);
    if (f.size > MAX_FILE_BYTES) throw new UserError(`${f.name.slice(0, 80)} is larger than 15 MB.`, 413);
    total += f.size;
  }
  if (total > MAX_TOTAL_BYTES) throw new UserError("Files are larger than 30 MB in total.", 413);
}

export const MODES = ["docs", "writer", "slides", "sheets", "image"];
export const SHAPES = ["square", "landscape", "portrait"];
export function oneOf(v, list, name = "Value") {
  if (typeof v !== "string" || !list.includes(v)) throw new UserError(`${name} is invalid.`);
  return v;
}

export const IMAGE_MODELS = ["gpt-image-1", "dall-e-3"];
export const REF_EXT = [".png", ".jpg", ".jpeg", ".webp"];
export const MAX_REFS = 2;
export const MAX_REF_BYTES = 10 * 1024 * 1024;

export function checkRefs(files) {
  if (files.length > MAX_REFS) throw new UserError(`Upload at most ${MAX_REFS} reference images.`);
  for (const f of files) {
    if (typeof f === "string" || typeof f.arrayBuffer !== "function") throw new UserError("Invalid file upload.");
    const ext = (f.name.match(/\.[^.]+$/) || [""])[0].toLowerCase();
    if (!REF_EXT.includes(ext)) throw new UserError("Reference images must be PNG, JPG or WebP.");
    if (f.size > MAX_REF_BYTES) throw new UserError("Reference images must be under 10 MB.", 413);
  }
}
/** Real file signature check (PNG / JPEG / WebP). */
export function imageMime(buf) {
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.slice(0, 4).toString("latin1") === "RIFF" && buf.slice(8, 12).toString("latin1") === "WEBP") return "image/webp";
  return null;
}
