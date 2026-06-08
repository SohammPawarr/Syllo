import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { Document } from '@/lib/db/models';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Save to local temp folder for backend to access
    const uploadDir = path.join(process.cwd(), 'ai-backend', 'temp_uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, file.name);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    const fileUri = filePath; // Pass absolute local path to celery

    // Create tracking document in MongoDB with a valid ObjectId
    const doc = await Document.create({
      title: file.name,
      fileUrl: fileUri,
      processingStatus: 'PENDING'
    });

    return NextResponse.json({ fileUri, documentId: doc._id.toString(), status: 'uploaded' }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
