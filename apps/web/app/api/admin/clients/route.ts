import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/clients
 * Create a new client (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { name, contact_name, contact_email, subscription_tier } = await req.json();

    if (!name || !contact_email) {
      return NextResponse.json(
        { ok: false, error: 'Name and contact email are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Create client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name,
        contact_name: contact_name || null,
        contact_email,
        subscription_tier: subscription_tier || 'starter',
        active: true,
      })
      .select('id')
      .single();

    if (clientError) {
      console.error('[Admin API] Error creating client:', clientError);
      return NextResponse.json(
        { ok: false, error: 'Failed to create client' },
        { status: 500 }
      );
    }

    console.log('[Admin API] Client created:', client.id);

    return NextResponse.json({ ok: true, clientId: client.id });
  } catch (error: any) {
    console.error('[Admin API] Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
