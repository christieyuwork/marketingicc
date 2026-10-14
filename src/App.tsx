import { CakeProvider } from "@cake-admin/cakeand";
import { BrowserRouter, Route, Routes } from "react-router";
import { Shell } from "./components/Shell";
import { Dashboard } from "./pages/Dashboard";
import { EmptySection } from "./pages/EmptySection";

export default function App() {
  return (
    <CakeProvider mode="dark.a">
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Dashboard />} />
            <Route path="registration" element={<EmptySection title="Registration" />} />
            <Route path="seating" element={<EmptySection title="Seating" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CakeProvider>
  );
}
