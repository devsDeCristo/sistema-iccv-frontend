import { Routes, Route } from 'react-router-dom';
import { Users } from '..';
import { RegisterUser } from '../register';
import { EditUser } from '../edit';
import { usePermission } from '../../../hooks/usePermission';

function RoutesUsers() {
  const permission = usePermission();

  return (
    <Routes>
      <Route path="/cadastro-cursilho" element={<RegisterUser />} />
      {permission && (
        <>
          <Route path="/" element={<Users />} />
          <Route path="/user/:id/editar" element={<EditUser />} />
        </>
      )}
    </Routes>
  );
}

export { RoutesUsers };
