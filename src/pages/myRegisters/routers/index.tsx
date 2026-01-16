import { Route } from "react-router-dom";
import { MyRegisters } from "..";



function RoutesMyRegisters() {
  return (
    <>
      <Route path="/minhasInscricoes" element={<MyRegisters/>} />
    </>
  );
}

export { RoutesMyRegisters };
