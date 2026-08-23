import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getProducts } from '@/lib/catalog';

const QuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  page: z.preprocess((v) => parseInt(String(v ?? '1'), 10), z.number().int().positive()).optional(),
  limit: z.preprocess((v) => parseInt(String(v ?? '10'), 10), z.number().int().positive().max(50)).optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());

  const parsed = QuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: parsed.error.format() }, { status: 400 });
  }

  const { q, category, page = 1, limit = 10 } = parsed.data;

  try {
    const result = await getProducts({ q, category, page, limit });
    return NextResponse.json(result);
  } catch (e) {
    console.error('Catalog list error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
