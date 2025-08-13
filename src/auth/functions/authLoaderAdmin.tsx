// src/routes/authLoader.ts
import { redirect } from 'react-router-dom';
import { apiClient } from '../../config/lib/axios/api-client';

export async function authLoaderAdmin() {
  try {
    const { data } = await apiClient.get('/auth/admin/validate');
    return data;
  } catch {
    localStorage.removeItem('access_token');
    // interrompe o carregamento e leva ao login
    return redirect('/login');
  }
}
