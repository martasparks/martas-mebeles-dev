import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Inicializē S3 klientu ar .env datiem
const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

// 🔹 Palīgfunkcija faila nosaukumam
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop() || "";
  return `${timestamp}-${randomString}.${extension}`;
}

// 🔹 Augšupielādē failu uz S3 un atgriež PILNU publisko URL
export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = "products"
): Promise<string> {
  const key = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Atgriež pilnu publisku URL
  return `https://${BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
}

// 🔹 Dzēš failu no S3
export async function deleteFromS3(fileName: string, folder: string = "products"): Promise<void> {
  const key = `${folder}/${fileName}`;

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

// 🔹 Validācija (atļaut tikai bildes)
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: "Atļauti tikai JPEG, PNG vai WebP attēli" };
  }
  return { isValid: true };
}