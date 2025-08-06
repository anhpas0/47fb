"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

export default function Admin() {
    // State mới để lưu trữ các footer đang được chỉnh sửa
    const [footers, setFooters] = useState<Record<string, string>>({});
    
    // Các state cũ
    const [settings, setSettings] = useState<{ gemini_api_key?: string }>({});
    const [pages, setPages] = useState<Array<{ id: string; name: string; access_token: string }>>([]);
    const [selectedPage, setSelectedPage] = useState('');
    const [status, setStatus] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        const loginStatus = searchParams.get('login');
        if (loginStatus === 'success') setStatus('✅ Đăng nhập Facebook thành công! Vui lòng cấu hình footer và lưu lại.');
        if (loginStatus === 'failed') setStatus('❌ Đăng nhập Facebook thất bại.');

        const fetchInitialData = async () => {
            try {
                const settingsRes = await axios.get('/api/admin/settings');
                setSettings({ gemini_api_key: settingsRes.data.gemini_api_key || '' });
                setSelectedPage(settingsRes.data.facebook_page_id || '');
                // Nạp các footer đã lưu vào state
                setFooters(settingsRes.data.page_footers || {});

                if (settingsRes.data.facebook_user_access_token) {
                    setIsLoggedIn(true);
                    const pagesRes = await axios.get('/api/facebook/pages');
                    setPages(pagesRes.data || []);
                }
            } catch { console.error('Error fetching initial data'); }
        };
        fetchInitialData();
    }, [searchParams]);

    const handleLogin = () => { window.location.href = '/api/facebook/login'; };

    // Hàm cập nhật footer cho một page cụ thể
    const handleFooterChange = (pageId: string, value: string) => {
        setFooters(prevFooters => ({
            ...prevFooters,
            [pageId]: value,
        }));
    };

    const handleSave = async () => {
        setStatus('Đang lưu...');
        try {
            const selectedPageData = pages.find(p => p.id === selectedPage);
            const dataToSave = {
                gemini_api_key: settings.gemini_api_key,
                // Vẫn lưu page được CHỌN để đăng bài
                facebook_page_id: selectedPageData ? selectedPageData.id : '',
                facebook_page_access_token: selectedPageData ? selectedPageData.access_token : '',
                // Gửi toàn bộ object footers về để lưu
                page_footers: footers,
            };
            await axios.post('/api/admin/settings', dataToSave);
            setStatus('✅ Đã lưu cài đặt thành công!');
        } catch { setStatus('❌ Lưu cài đặt thất bại.'); }
    };
    
    return (
        <div>
            <h2>Trang quản trị</h2>
            {status && <div className="p-3 my-2 bg-gray-100 rounded text-center">{status}</div>}
            <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Cài đặt API Key</h3>
                    <label className="block mb-1">Gemini API Key:</label>
                    <input type="password" value={settings.gemini_api_key || ''} onChange={(e) => setSettings({ ...settings, gemini_api_key: e.target.value })} className="w-full p-2 border rounded" />
                </div>

                <div className="p-4 border rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Cài đặt Fanpage và Footer</h3>
                    {!isLoggedIn ? (
                        <button onClick={handleLogin} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Đăng nhập bằng Facebook</button>
                    ) : (
                        <div className="space-y-4">
                            <p>Chọn Fanpage mặc định để đăng bài và cấu hình footer cho từng trang.</p>
                            {pages.map((page) => (
                                <div key={page.id} className="p-3 bg-gray-50 rounded-md border flex items-center gap-4">
                                    <input
                                        type="radio"
                                        name="selectedPage"
                                        id={`page-${page.id}`}
                                        value={page.id}
                                        checked={selectedPage === page.id}
                                        onChange={(e) => setSelectedPage(e.target.value)}
                                        className="h-5 w-5"
                                    />
                                    <div className="flex-grow">
                                        <label htmlFor={`page-${page.id}`} className="font-semibold block">{page.name}</label>
                                        <textarea
                                            placeholder={`Nhập footer cho trang ${page.name}...`}
                                            value={footers[page.id] || ''}
                                            onChange={(e) => handleFooterChange(page.id, e.target.value)}
                                            className="w-full mt-1 p-2 border rounded text-sm"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button onClick={handleSave} className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400">Lưu Cài Đặt</button>
            </div>
        </div>
    );
}