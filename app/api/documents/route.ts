import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/db/mongoose";
import { Document, User } from "@/lib/db/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const documents = await Document.find({ userId: user._id })
      .sort({ _id: -1 }) // Newest first
      .select("title processingStatus _id");

    const mappedDocs = documents.map((doc) => ({
      id: doc._id.toString(),
      name: doc.title || "Untitled Document",
      status: doc.processingStatus === "READY" ? "ready" : "processing",
    }));

    return NextResponse.json({ documents: mappedDocs });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
