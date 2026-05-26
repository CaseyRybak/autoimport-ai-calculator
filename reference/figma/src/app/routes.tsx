import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Calculator } from "./components/Calculator";
import { CalculationResult } from "./components/CalculationResult";
import { LeadForm } from "./components/LeadForm";
import { AdminLogin } from "./components/AdminLogin";
import { AdminLeadsList } from "./components/AdminLeadsList";
import { LeadDetail } from "./components/LeadDetail";
import { Settings } from "./components/Settings";
import { HowItWorks } from "./components/HowItWorks";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Calculator },
      { path: "result", Component: CalculationResult },
      { path: "lead-form", Component: LeadForm },
      { path: "how-it-works", Component: HowItWorks },
      { path: "admin", Component: AdminLogin },
      { path: "admin/leads", Component: AdminLeadsList },
      { path: "admin/leads/:id", Component: LeadDetail },
      { path: "admin/settings", Component: Settings },
    ],
  },
]);
