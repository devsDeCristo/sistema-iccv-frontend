function usePermission() {
  const permission = localStorage.getItem('user');
  return permission === 'iccv';
}

export { usePermission };
