import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Client } from "@notionhq/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { pageId } = body;

    if (!pageId) {
      return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
    }

    if (!process.env.NOTION_API_KEY) {
      return NextResponse.json(
        { error: "Notion API Key is not configured on the server." },
        { status: 500 }
      );
    }

    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    // Fetch page blocks
    let rawText = "";
    let hasMore = true;
    let nextCursor: string | undefined = undefined;

    while (hasMore) {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: nextCursor,
        page_size: 100,
      });

      for (const block of response.results) {
        if ("type" in block) {
          const type = block.type;
          // @ts-ignore - dynamic access to rich_text property based on block type
          const richText = (block as any)[type]?.rich_text;
          
          if (richText && Array.isArray(richText)) {
            const blockText = richText.map((t: any) => t.plain_text).join("");
            if (blockText) {
              rawText += blockText + "\n";
            }
          }
        }
      }

      hasMore = response.has_more;
      nextCursor = response.next_cursor ?? undefined;
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "No text found on the Notion page, or page is inaccessible." },
        { status: 404 }
      );
    }

    return NextResponse.json({ text: rawText });
  } catch (error: any) {
    console.error("Notion API Error:", error);
    
    // Handle Notion specific errors
    if (error.status === 401) {
      return NextResponse.json({ error: "Invalid Notion API Key." }, { status: 401 });
    }
    if (error.status === 404) {
      return NextResponse.json(
        { error: "Notion page not found. Make sure the integration is connected to the page." },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
