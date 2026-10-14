import { getDashboard } from "../server/dashboardData";

export function GET() {
  return Response.json(getDashboard());
}
