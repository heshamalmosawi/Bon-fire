import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { extname } from "path";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    // const file = req.body.file as File;
    const form  = await req.formData()

    const file = form.get("file") as File

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Generate a new filename using UUID and preserve the file extension
    const fileExtension = extname(file.name);
    const newFileName = `${uuidv4()}${fileExtension}`;

    // Upload the file to Supabase Storage
    const { error } = await supabase.storage
      .from("main-bonfire-bucket")
      .upload(newFileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Generate a public URL for the uploaded file
    const { data } = supabase.storage
      .from("main-bonfire-bucket")
      .getPublicUrl(newFileName);

    return NextResponse.json({ url: data.publicUrl }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "File upload failed, check console log" },
      { status: 500 }
    );
  }
}
