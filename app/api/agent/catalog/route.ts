import { NextResponse } from 'next/server';
import { getAgentCatalog } from '@/lib/catalog';

export async function GET() {
  try {
    const result = await getAgentCatalog();
    return NextResponse.json(result);
  } catch (e) {
    console.error('Agent catalog error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
