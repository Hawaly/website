import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Le mot de passe est requis' },
        { status: 400 }
      );
    }

    // Hash avec bcrypt (10 rounds)
    const hash = await bcrypt.hash(password, 10);

    return NextResponse.json({ hash });
  } catch (error) {
    console.error('Erreur lors du hashage:', error);
    return NextResponse.json(
      { error: 'Erreur lors du hashage du mot de passe' },
      { status: 500 }
    );
  }
}
