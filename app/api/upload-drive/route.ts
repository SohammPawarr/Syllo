import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { Document, User } from '@/lib/db/models';
import path from 'path';
import fs from 'fs/promises';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { fileId, fileName, accessToken } = await req.json();

    if (!fileId || !accessToken) {
      return NextResponse.json({ error: 'Missing fileId or accessToken' }, { status: 400 });
    }

    // Define the path to save the file locally
    const uploadDir = path.join(process.cwd(), 'ai-backend', 'temp_uploads');
    
    // Ensure the directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Clean filename
    const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const localFilePath = path.join(uploadDir, `${Date.now()}_${safeName}`);

    // Download the file from Google Drive
    const driveRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!driveRes.ok) {
      const errorText = await driveRes.text();
      throw new Error(`Failed to download from Drive: ${driveRes.statusText} - ${errorText}`);
    }

    const arrayBuffer = await driveRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(localFilePath, buffer);

    // Create the document in MongoDB tracking
    const doc = await Document.create({
      userId: user._id,
      title: fileName,
      fileUrl: localFilePath, // Save absolute path for celery
      processingStatus: 'PENDING',
    });

    return NextResponse.json({ 
      fileUri: localFilePath, 
      documentId: doc._id.toString(), 
      status: 'uploaded' 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error in /api/upload-drive:', error);
    return NextResponse.json({ error: 'Failed to process Google Drive file' }, { status: 500 });
  }
}
