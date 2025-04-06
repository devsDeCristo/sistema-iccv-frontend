// import { User } from '../types/user';

function useRole() {
  // const localStorageUser = localStorage.getItem('user');
  // const user: User | null = localStorageUser
  //   ? JSON.parse(localStorageUser)
  //   : null;
  // const role = user?.role;
  const role = localStorage.getItem('role');

  if (role === '1') {
    return true;
  } else {
    return false;
  }
}

export { useRole };
