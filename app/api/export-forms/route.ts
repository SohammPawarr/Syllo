import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const { title, questions } = await req.json();

    if (!title || !questions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    // @ts-ignore
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const forms = google.forms({ version: 'v1', auth: oauth2Client });

    // Step 1: Create an empty form
    const createRes = await forms.forms.create({
      requestBody: { info: { title: title || 'Generated Quiz' } }
    });
    
    const formId = createRes.data.formId;

    if (!formId) {
      throw new Error("Failed to create Google Form");
    }

    // Step 2: Build the batch update request
    const requests = questions.map((q: any, index: number) => ({
      createItem: {
        item: {
          title: q.question,
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: 'RADIO',
                options: q.options.map((opt: string) => ({ value: opt }))
              }
            }
          }
        },
        location: { index }
      }
    }));

    // Step 3: Mutate the form with the new questions
    await forms.forms.batchUpdate({
      formId,
      requestBody: { requests }
    });

    return NextResponse.json({ 
      formUrl: createRes.data.responderUri,
      editUrl: `https://docs.google.com/forms/d/${formId}/edit` 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Form export error:", error);
    return NextResponse.json({ error: error.message || "Failed to export to Google Forms" }, { status: 500 });
  }
}
