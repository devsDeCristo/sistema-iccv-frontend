function usePermission() {
  const permission = localStorage.getItem('access_token');

  return !!permission;
}

export { usePermission };
