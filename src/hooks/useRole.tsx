import { User } from '../types/user';

function useRole() {
  const localStorageUser = localStorage.getItem('user');
  // const user: User = localStorageUser ? JSON.parse(localStorageUser) : null;
  let user: User | null = null;
  try {
    user = localStorageUser ? JSON.parse(localStorageUser) : null;
  } catch (error) {
    console.error('Erro ao parsear o JSON do usuário:', error);
    user = null; // Define como null caso o JSON seja inválido
  }

  if (user) {
    const { role } = user;
    if (role && role === 1) return true;
    return false;
  } else {
    return false;
  }
}

export { useRole };
