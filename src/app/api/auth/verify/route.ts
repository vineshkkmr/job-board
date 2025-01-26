import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      console.error('No ID token provided');
      return NextResponse.json(
        { isAuthenticated: false, role: null, error: 'No ID token provided' },
        { status: 401 }
      );
    }

    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      console.log('Token verified successfully:', decodedToken.uid);
      
      const user = await auth.getUser(decodedToken.uid);
      console.log('User fetched successfully:', user.uid);
      
      const customClaims = user.customClaims || {};
      console.log('User claims:', customClaims);

      return NextResponse.json({
        isAuthenticated: true,
        role: customClaims.role || null,
        uid: user.uid,
      });
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return NextResponse.json(
        { 
          isAuthenticated: false, 
          role: null, 
          error: 'Invalid token' 
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { 
        isAuthenticated: false, 
        role: null, 
        error: 'Server error' 
      },
      { status: 500 }
    );
  }
}
