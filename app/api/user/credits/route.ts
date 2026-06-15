import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getOrCreateUserWithCredits } from '@/lib/db/userService';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUserWithCredits(session.user.email);
    
    // Calculate hours until next UTC midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(24, 0, 0, 0);
    const diffMs = tomorrow.getTime() - now.getTime();
    const renewsInHrs = Math.ceil(diffMs / (1000 * 60 * 60));

    return NextResponse.json({ 
      credits: user.credits,
      maxCredits: 10000,
      renewsInHrs 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
