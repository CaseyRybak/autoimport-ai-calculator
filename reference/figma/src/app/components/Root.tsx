import { Outlet, Link, useLocation } from "react-router";
import { Car } from "lucide-react";

export function Root() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute && location.pathname !== '/admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Car className="w-8 h-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">AutoImport AI</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Калькулятор
              </Link>
              <Link
                to="/how-it-works"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Как считается
              </Link>
              <Link
                to="/lead-form"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Заявка
              </Link>
              <Link
                to="/admin"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Демо-админка
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
