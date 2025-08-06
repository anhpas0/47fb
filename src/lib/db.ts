// src/lib/db.ts - Phiên bản cho Vercel

// Định nghĩa cấu trúc cài đặt
export interface Settings {
  gemini_api_key?: string;
  facebook_page_id?: string;
  facebook_page_access_token?: string;
  facebook_user_access_token?: string;
  page_footers?: Record<string, string>;
}

// Hàm này sẽ đọc cài đặt từ Biến môi trường của Vercel
export async function getSettings(): Promise<Settings> {
  // Biến môi trường của Vercel không hỗ trợ object lồng nhau,
  // nên chúng ta sẽ lưu page_footers dưới dạng một chuỗi JSON.
  let pageFooters = {};
  try {
    if (process.env.PAGE_FOOTERS_JSON) {
      pageFooters = JSON.parse(process.env.PAGE_FOOTERS_JSON);
    }
  } catch (e) {
    console.error("Lỗi khi đọc PAGE_FOOTERS_JSON:", e);
  }

  return {
    gemini_api_key: process.env.GEMINI_API_KEY,
    facebook_page_id: process.env.FACEBOOK_PAGE_ID,
    facebook_page_access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
    facebook_user_access_token: process.env.FACEBOOK_USER_ACCESS_TOKEN,
    page_footers: pageFooters,
  };
}

// Trên Vercel, chúng ta không thể ghi vào file.
// Việc lưu cài đặt sẽ được thực hiện trên dashboard của Vercel.
// Hàm này được giữ lại để code không bị lỗi, nhưng nó không làm gì cả.
export async function saveSettings(newSettings: Partial<Settings>): Promise<void> {
  console.log("Lưu ý: Chức năng saveSettings không hoạt động trên Vercel. Vui lòng cập nhật Biến môi trường trên dashboard.");
  return Promise.resolve();
}