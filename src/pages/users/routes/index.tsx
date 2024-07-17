import { Routes, Route } from 'react-router-dom';
import { Users } from '..';
import { RegisterUser } from '../register';
import { EditUser } from '../edit';
import { usePermission } from '../../../hooks/usePermission';

function RoutesUsers() {
  const permission = usePermission();

  return (
    <Routes>
      {permission && (
        <>
          <Route path="/cadastro-cursilho" element={<RegisterUser />} />
          <Route path="/" element={<Users />} />
          <Route path="/user/:id/editar" element={<EditUser />} />
        </>
      )}
    </Routes>
  );
}

export { RoutesUsers };
