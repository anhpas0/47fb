import { redirect } from 'next/navigation';

export async function GET() {
  const appId = process.env.FACEBOOK_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/facebook/callback`;
  const scope = 'pages_show_list,pages_manage_posts,pages_read_engagement';
  const fbLoginUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  redirect(fbLoginUrl);
}