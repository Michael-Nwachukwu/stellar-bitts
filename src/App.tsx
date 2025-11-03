import "./App.module.css";
import { Routes, Route, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import Debugger from "./pages/Debugger.tsx";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import CreateOffer from "./pages/CreateOffer";
import Borrow from "./pages/Borrow";
import Position from "./pages/Position";

const AppLayout: React.FC = () => (
  <main>
    <Outlet />
  </main>
);

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/debug" element={<Debugger />} />
        <Route path="/debug/:contractName" element={<Debugger />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/create-offer" element={<CreateOffer />} />
        <Route path="/borrow/:offerId" element={<Borrow />} />
        <Route path="/position/:loanId" element={<Position />} />
      </Route>
    </Routes>
  );
}

export default App;
