import { NextResponse } from 'next/server';
import axios from 'axios';
import { getSettings } from '@/lib/db';

export async function GET() {
  const settings = await getSettings();
  const userAccessToken = settings.facebook_user_access_token;

  if (!userAccessToken) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  const url = `https://graph.facebook.com/me/accounts?fields=id,name,access_token&access_token=${userAccessToken}`;
  try {
    const response = await axios.get(url);
    return NextResponse.json(response.data.data || []);
  } catch (error) {
    return NextResponse.json({ error: 'Không thể lấy Fanpage' }, { status: 400 });
  }
}