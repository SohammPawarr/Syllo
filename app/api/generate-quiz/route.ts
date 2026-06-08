import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:7860';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const backendBody = {
      ...body,
      document_id: body.documentId,
    };

    const response = await fetch(`${BACKEND_URL}/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to generate quiz');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Generate Quiz Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
