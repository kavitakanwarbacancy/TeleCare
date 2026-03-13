import path from "path";
import fs from "fs";
import { prisma } from "../../db";
import { FileType } from "../../../generated/prisma";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function getFileType(mimeType: string): FileType {
  if (mimeType.startsWith("image/")) return FileType.IMAGE;
  if (mimeType === "application/pdf") return FileType.REPORT;
  if (mimeType.includes("document") || mimeType.includes("text")) return FileType.DOCUMENT;
  return FileType.OTHER;
}

export async function saveFile(
  file: Express.Multer.File,
  userId: string,
  appointmentId?: string
) {
  const timestamp = Date.now();
  const ext = path.extname(file.originalname);
  const storageKey = `${timestamp}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filePath = path.join(UPLOADS_DIR, storageKey);

  fs.writeFileSync(filePath, file.buffer);

  const fileRecord = await prisma.file.create({
    data: {
      ownerId: userId,
      uploadedById: userId,
      appointmentId: appointmentId || null,
      type: getFileType(file.mimetype),
      storageKey,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: BigInt(file.size),
    },
    include: {
      uploadedBy: { select: { id: true, name: true, role: true } },
    },
  });

  return fileRecord;
}

export async function getFileById(fileId: string) {
  return prisma.file.findUnique({
    where: { id: fileId },
    include: {
      uploadedBy: { select: { id: true, name: true, role: true } },
    },
  });
}

export async function getFilesByAppointment(appointmentId: string) {
  return prisma.file.findMany({
    where: { appointmentId },
    include: {
      uploadedBy: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getFilePath(storageKey: string): string {
  return path.join(UPLOADS_DIR, storageKey);
}

export async function deleteFile(fileId: string, userId: string) {
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  
  if (!file) return null;
  if (file.ownerId !== userId && file.uploadedById !== userId) {
    throw new Error("Not authorized to delete this file");
  }

  const filePath = path.join(UPLOADS_DIR, file.storageKey);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await prisma.file.delete({ where: { id: fileId } });
  return file;
}
