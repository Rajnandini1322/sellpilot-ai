import { NextResponse } from 'next/server';
import { getProductById } from '@/lib/catalog';

 
export async function GET(req: Request, ctx: any) {
  const { id } = ctx?.params || {};
  try {
    const product = await getProductById(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ product });
  } catch (e) {
    console.error('Catalog getById error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
