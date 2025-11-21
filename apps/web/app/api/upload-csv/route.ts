import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserClientId } from '@/lib/auth';
import { parseOperationalCSV } from '@/lib/csvParser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/upload-csv
 * Upload and parse CSV file with operational data
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUserClientId();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const dataType = formData.get('dataType') as string;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!['sales', 'warehouse', 'staff', 'support', 'finance', 'mixed'].includes(dataType)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid data type' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json(
        { ok: false, error: 'File must be a CSV' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    console.log('[CSV Upload] Processing file:', file.name, 'Type:', dataType);

    // Parse CSV
    const parseResult = await parseOperationalCSV(file, dataType as any);

    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: parseResult.error || 'Failed to parse CSV' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Upload file to Supabase Storage
    const fileName = `${user}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('csv-uploads')
      .upload(fileName, file, {
        contentType: 'text/csv',
        upsert: false,
      });

    if (uploadError) {
      console.error('[CSV Upload] Storage error:', uploadError);
      return NextResponse.json(
        { ok: false, error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('csv-uploads')
      .getPublicUrl(fileName);

    // Save upload record to database
    const { data: uploadRecord, error: dbError } = await supabase
      .from('csv_uploads')
      .insert({
        client_id: user,
        uploaded_by: user,
        file_name: file.name,
        file_url: urlData.publicUrl,
        data_type: dataType,
        row_count: parseResult.rowCount,
        status: 'processed',
        processed_data: parseResult.data,
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('[CSV Upload] Database error:', dbError);
      return NextResponse.json(
        { ok: false, error: 'Failed to save upload record' },
        { status: 500 }
      );
    }

    console.log('[CSV Upload] Success:', uploadRecord.id);

    return NextResponse.json({
      ok: true,
      uploadId: uploadRecord.id,
      rowCount: parseResult.rowCount,
      parsedData: parseResult.data,
    });
  } catch (error: any) {
    console.error('[CSV Upload] Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
