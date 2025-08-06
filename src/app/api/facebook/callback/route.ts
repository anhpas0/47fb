import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { saveSettings } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) return NextResponse.redirect(new URL('/admin?login=failed', request.url));
  
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/facebook/callback`;
  const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`;

  try {
    const response = await axios.get(tokenUrl);
    const userAccessToken = response.data.access_token;
    if (userAccessToken) {
      await saveSettings({ facebook_user_access_token: userAccessToken });
      return NextResponse.redirect(new URL('/admin?login=success', request.url));
    }
    throw new Error('Token không hợp lệ');
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL('/admin?login=failed', request.url));
  }
}