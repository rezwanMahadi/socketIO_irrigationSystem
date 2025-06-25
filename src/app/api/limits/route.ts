import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const limitId = parseInt(url.searchParams.get('limitId') || '11');
    try {
        const limit = await prisma.limit.findUnique({
            where: {
                id: limitId,
            }
        });
        return NextResponse.json(limit);
    } catch (error) {
        console.error('Error fetching limit:', error);
        return NextResponse.json({ error: 'Failed to fetch limit' }, { status: 500 });
    }
}