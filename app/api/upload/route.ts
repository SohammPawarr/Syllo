import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { Document, User } from '@/lib/db/models';
import path from 'path';
import fs from 'fs/promises';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { deductCredits } from '@/lib/db/userService';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const UPLOAD_COST = 1000;

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds the 10MB size limit." }, { status: 400 });
    }

    try {
      await deductCredits(session.user.email, UPLOAD_COST);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 402 });
    }

    // Save to local temp folder for backend to access
    const uploadDir = path.join(process.cwd(), 'ai-backend', 'temp_uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, file.name);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    const fileUri = filePath; // Pass absolute local path to celery

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create tracking document in MongoDB with a valid ObjectId
    const doc = await Document.create({
      userId: user._id,
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
