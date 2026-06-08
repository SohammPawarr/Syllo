import { NextResponse } from 'next/server';

const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || 'http://localhost:7860';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { documentId, topic } = body;

    if (!documentId || !topic) {
      return NextResponse.json({ error: 'Missing documentId or topic' }, { status: 400 });
    }

    const response = await fetch(`${AI_BACKEND_URL}/v1/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document_id: documentId,
        topic: topic,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to generate image URL');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Generate image error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
