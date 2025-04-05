function useRole() {
  const user = JSON.parse(localStorage.getItem('user') || '');

  if (user && user?.role === 1) {
    return true;
  } else {
    return false;
  }
}
export { useRole };
