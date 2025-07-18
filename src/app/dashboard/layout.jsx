// app/dashboard/layout.jsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {jwtDecode} from 'jwt-decode';
import NoAccessPage from '@/components/NoAcces';
import { decode } from 'jsonwebtoken';

export default async function DashboardLayout({ children }) {
  const cookieStore = cookies();
  const token = cookieStore.get('access')?.value;

  let isAuthorized = false;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log(decoded.email);
      
      const currentTime = Math.floor(Date.now() / 1000);
       

      if (   decoded.exp > currentTime) isAuthorized = true 

   
    } catch (error) {
      console.error('Token validation error:', error);
    }
  }

  if (!isAuthorized) {
    return <NoAccessPage />
  }

  return <div>{children}</div>;
}