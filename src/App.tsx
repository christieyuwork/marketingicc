import { CakeProvider } from "@cake-admin/cakeand";
import { BrowserRouter, Route, Routes } from "react-router";
import { Shell } from "./components/Shell";
import { Dashboard } from "./pages/Dashboard";
import { Registration } from "./pages/Registration";
import { Seating } from "./pages/Seating";

export default function App() {
  return (
    <CakeProvider mode="dark.a">
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Dashboard />} />
            <Route path="registration" element={<Registration />} />
            <Route path="seating" element={<Seating />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CakeProvider>
  );
}
