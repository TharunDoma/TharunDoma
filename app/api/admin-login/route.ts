import { NextResponse } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(req: Request) {
  try {
    const { secret } = await req.json();

    if (!secret) {
      return NextResponse.json({
        success: false,
        message: 'Please enter your security key'
      });
    }

    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({
        success: false,
        message: 'Invalid security key'
      });
    }

    // Reuse the secret as token so downstream admin calls can authenticate
    const token = ADMIN_SECRET;

    return NextResponse.json({
      success: true,
      token,
      message: 'Login successful!'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Login failed'
    });
  }
}
