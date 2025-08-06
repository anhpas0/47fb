import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/db'; // Dùng alias '@'

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await saveSettings(body);
    return NextResponse.json({ success: true, message: 'Cài đặt đã được lưu.' });
  } catch (error) {
    console.error('Lỗi khi lưu cài đặt:', error);
    return NextResponse.json({ success: false, message: 'Không thể lưu cài đặt.' }, { status: 500 });
  }
}