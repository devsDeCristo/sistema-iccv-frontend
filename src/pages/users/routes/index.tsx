import { Route } from 'react-router-dom';
// import { Users } from '..';
// import { RegisterUser } from '../register';
// import { EditUser } from '../edit';
import { AssociateEvent } from '../associateEvent';

function RoutesUsers() {
  return (
    <>
      <Route path="/cadastrar-cursilho" element={<AssociateEvent />} />
      {/* <Route path="/usuario/cadastrar" element={<RegisterUser />} /> */}
      {/* <Route
        path="/cadastro-cursilho-work/participar"
        element={<AssociateUser />}
      /> */}
    </>
  );
}

export { RoutesUsers };
