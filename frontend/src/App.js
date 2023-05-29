import { Navigate, Route, Routes } from "react-router-dom";
import ControllerPage from "./pages/ControllerPage";
import RemoteCamPage from "./pages/RemoteCamPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/control" />} />
      <Route path="/control" element={<ControllerPage />} />
      <Route path="/cam" element={<RemoteCamPage />} />
    </Routes>
  );
};

export default App;
