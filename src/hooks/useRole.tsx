import { User } from '../types/user';

function useRole() {
  const localStorageUser = localStorage.getItem('user');
  const user: User = localStorageUser ? JSON.parse(localStorageUser) : null;

  if (user) {
    const { role } = user;
    if (role && role === 1) return true;
    return false;
  } else {
    return false;
  }
}

export { useRole };
