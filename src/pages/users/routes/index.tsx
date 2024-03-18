import { Routes, Route } from 'react-router-dom';
import { Users } from '..';
import { RegisterUser } from '../register';
import { EditUser } from '../edit';
import { usePermission } from '../../../hooks/usePermission';

function RoutesUsers() {
  const permission = usePermission();

  return (
    <Routes>
      {/* Rota previa para que o usuario seja redirecionado para a rota de cadastro */}
      <Route path="*" element={<RegisterUser />} />
      <Route path="/cadastro-cursilho-masculino" element={<RegisterUser />} />
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
