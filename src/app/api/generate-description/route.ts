import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSettings } from '@/lib/db';

export async function POST(request: Request) {
  const settings = await getSettings();
  const apiKey = settings.gemini_api_key;
  if (!apiKey) return NextResponse.json({ error: 'Chưa có Gemini API Key' }, { status: 400 });

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    if (!imageFile) return NextResponse.json({ error: 'Không có ảnh' }, { status: 400 });

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const imagePart = {
      inlineData: { data: imageBuffer.toString('base64'), mimeType: imageFile.type },
    };
    const prompt = "Viết một mô tả hấp dẫn cho bài đăng trên mạng xã hội dựa trên hình ảnh này. Hãy luôn trả lời bằng tiếng Việt";
    const result = await model.generateContent([prompt, imagePart]);
    return NextResponse.json({ description: result.response.text() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Lỗi từ Gemini' }, { status: 500 });
  }
}