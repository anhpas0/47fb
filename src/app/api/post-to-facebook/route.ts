import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(request: Request) {
  const settings = await getSettings();
  const { facebook_page_id: pageId, facebook_page_access_token: accessToken } = settings;
  if (!pageId || !accessToken) return NextResponse.json({ error: 'Chưa cấu hình Fanpage' }, { status: 400 });
  
  try {
    const data = await request.formData();
    const imageFile = data.get('image') as File | null;
    if (!imageFile) return NextResponse.json({ error: 'Không có ảnh' }, { status: 400 });

    const description = data.get('description') as string || '';
    const footer = data.get('footer') as string || '';
    const scheduledTime = data.get('scheduledTime') as string | undefined;
    const caption = footer ? `${description}\n\n${footer}` : description;
    
    const fbFormData = new FormData();
    fbFormData.append('access_token', accessToken);
    fbFormData.append('caption', caption);
    fbFormData.append('source', Buffer.from(await imageFile.arrayBuffer()), imageFile.name);

    if (scheduledTime) {
      fbFormData.append('published', 'false');
      fbFormData.append('scheduled_publish_time', scheduledTime);
    }

    const url = `https://graph.facebook.com/${pageId}/photos`;
    const response = await axios.post(url, fbFormData, { headers: fbFormData.getHeaders() });
    return NextResponse.json({ success: true, data: response.data });
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { error?: string } } };
    console.error(axiosError.response?.data || error);
    return NextResponse.json({ success: false, error: axiosError.response?.data?.error || 'Lỗi không xác định' }, { status: 500 });
  }
}