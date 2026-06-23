import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { Document, User } from '@/lib/db/models';
import path from 'path';
import fs from 'fs/promises';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { deductCredits } from '@/lib/db/userService';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const UPLOAD_COST = 1000;

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, fileUri } = await req.json();

    if (!fileName || !fileUri) {
      return NextResponse.json({ error: "Missing file details" }, { status: 400 });
    }

    try {
      await deductCredits(session.user.email, UPLOAD_COST);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 402 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create tracking document in MongoDB with a valid ObjectId
    const doc = await Document.create({
      userId: user._id,
      title: fileName,
      fileUrl: fileUri,
      processingStatus: 'PENDING'
    });

    return NextResponse.json({ fileUri, documentId: doc._id.toString(), status: 'uploaded' }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
