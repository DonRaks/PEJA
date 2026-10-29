import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email address and password are required.' },
        { status: 400 }
      );
    }

    const session = await authenticateAdmin(email, password);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid administrator credentials. Access denied.' },
        { status: 401 }
      );
    }

    await setSessionCookie(session);

    return NextResponse.json({
      success: true,
      user: session,
      message: 'Authentication successful. Welcome to PEJA Studio.',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal authentication error.' },
      { status: 500 }
    );
  }
}
