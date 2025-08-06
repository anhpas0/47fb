"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa lại cấu trúc của Settings để sử dụng trong Poster
interface AppSettings {
    gemini_api_key?: string;
    facebook_page_id?: string;
    facebook_page_access_token?: string;
    page_footers?: Record<string, string>;
}

export default function Poster() {
    const [appSettings, setAppSettings] = useState<AppSettings>({});
    
    // Các state cũ
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');

    // Lấy cài đặt khi component được tải lần đầu
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/admin/settings');
                setAppSettings(res.data);
            } catch (error) {
                console.error("Không thể tải cài đặt", error);
                setStatus("Lỗi: Không thể tải cài đặt. Vui lòng kiểm tra trang Admin.");
            }
        };
        fetchSettings();
    }, []);

    // Lấy footer động dựa trên page ID đã được chọn
    const activeFooter = appSettings.facebook_page_id 
        ? appSettings.page_footers?.[appSettings.facebook_page_id] || ''
        : '';

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... (Giữ nguyên hàm này)
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setStatus('');
            setDescription('');
        }
    };

    const handleGenerateDescription = async () => {
        // ... (Giữ nguyên hàm này)
        if (!image) { setStatus('Vui lòng chọn ảnh trước.'); return; }
        setIsLoading(true);
        setStatus('🤖 Đang tạo mô tả bằng Gemini...');
        const formData = new FormData();
        formData.append('image', image);
        try {
            const res = await axios.post('/api/generate-description', formData);
            setDescription(res.data.description);
            setStatus('✅ Tạo mô tả thành công!');
        } catch (error) { setStatus('❌ Lỗi: Không thể tạo mô tả.'); }
        finally { setIsLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image || !description) { setStatus('Cần có ảnh và mô tả.'); return; }
        if (!appSettings.facebook_page_id) { setStatus('Chưa có Fanpage nào được chọn. Vui lòng vào trang Admin để cấu hình.'); return; }

        setIsLoading(true);
        setStatus('🚀 Đang đăng bài...');
        const formData = new FormData();
        formData.append('image', image);
        formData.append('description', description);
        // Gửi footer động lấy được từ cài đặt
        formData.append('footer', activeFooter);

        if (scheduledTime) {
            const timestamp = Math.floor(new Date(scheduledTime).getTime() / 1000).toString();
            formData.append('scheduledTime', timestamp);
        }
        
        try {
            const res = await axios.post('/api/post-to-facebook', formData);
            if (res.data.success) {
                setStatus(scheduledTime ? '🎉 Đã hẹn lịch thành công!' : '🎉 Đăng bài thành công!');
                setImage(null); setPreview(''); setDescription(''); setScheduledTime('');
            } else { setStatus(`❌ Lỗi: ${res.data.error?.message || 'Lỗi không xác định'}`); }
        } catch (error: any) { setStatus(`❌ Lỗi: ${error.response?.data?.error?.message || 'Không thể kết nối.'}`); }
        finally { setIsLoading(false); }
    };
    
    return (
        <div>
            <h1>Công cụ đăng bài Facebook</h1>
            {status && <div className="p-3 my-2 bg-gray-100 rounded text-center">{status}</div>}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Panel trái */}
                <div className="space-y-4">
                    {/* ... (Phần này giữ nguyên không đổi) ... */}
                    <h3 className="font-bold text-lg">1. Tải ảnh lên</h3>
                    <input type="file" accept="image/*" onChange={handleImageChange} disabled={isLoading} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    {preview && <img src={preview} alt="Xem trước" className="rounded-lg border" />}
                    <button onClick={handleGenerateDescription} disabled={isLoading || !image} className="w-full px-4 py-2 bg-purple-600 text-white rounded disabled:bg-purple-300">Tạo mô tả với Gemini</button>
                </div>
                {/* Panel phải */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <h3 className="font-bold text-lg">2. Chỉnh sửa nội dung</h3>
                        <label className="block mb-1">Mô tả bài viết:</label>
                        <textarea rows={8} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    {/* Ô nhập footer đã được xóa bỏ */}
                    {/* Thay vào đó, chúng ta hiển thị footer sẽ được sử dụng */}
                    <div className="p-3 bg-gray-50 rounded-lg border">
                        <label className="block mb-1 font-semibold">Footer sẽ được sử dụng:</label>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{activeFooter || "(Không có footer nào được cấu hình cho trang này)"}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">3. Hẹn lịch (Tùy chọn)</h3>
                        <input type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <button type="submit" disabled={isLoading || !image || !description} className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300">
                        {isLoading ? 'Đang xử lý...' : (scheduledTime ? 'Hẹn lịch đăng' : 'Đăng ngay')}
                    </button>
                </form>
            </div>
        </div>
    );
}