import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import { Document } from '@/lib/db/models';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id: documentId } = await params;

    // Check status in MongoDB
    const doc = await Document.findById(documentId);

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // In a real implementation, we could also query Redis/Celery for exact progress percentage
    return NextResponse.json({
      documentId: doc._id,
      status: doc.processingStatus === 'READY' ? 'COMPLETED' : 'PROCESSING',
      phase: doc.processingStatus,
      result: doc.processingStatus === 'READY' ? { ready: true } : null
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch job status" }, { status: 500 });
  }
}
