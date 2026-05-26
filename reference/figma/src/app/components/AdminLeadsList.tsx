import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import {
  Users,
  Settings,
  BarChart3,
  FileText,
  Filter,
  Eye,
  LogOut,
  Menu,
  X,
} from "lucide-react";

type Lead = {
  id: string;
  date: string;
  client: string;
  car: string;
  country: string;
  budget: number;
  total: number;
  status: "new" | "in_progress" | "completed" | "rejected";
};

export function AdminLeadsList() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (!localStorage.getItem("adminAuth")) {
      navigate("/admin");
    }
  }, [navigate]);

  const mockLeads: Lead[] = [
    {
      id: "1",
      date: "26.05.2026",
      client: "Иван Петров",
      car: "Toyota Camry 2022",
      country: "korea",
      budget: 3000000,
      total: 2850000,
      status: "new",
    },
    {
      id: "2",
      date: "25.05.2026",
      client: "Мария Сидорова",
      car: "BMW X5 2021",
      country: "europe",
      budget: 5500000,
      total: 5200000,
      status: "in_progress",
    },
    {
      id: "3",
      date: "24.05.2026",
      client: "Алексей Смирнов",
      car: "Haval H9 2023",
      country: "china",
      budget: 3500000,
      total: 3300000,
      status: "completed",
    },
    {
      id: "4",
      date: "23.05.2026",
      client: "Елена Волкова",
      car: "Kia Sportage 2023",
      country: "korea",
      budget: 2500000,
      total: 2400000,
      status: "in_progress",
    },
    {
      id: "5",
      date: "22.05.2026",
      client: "Дмитрий Козлов",
      car: "Audi Q7 2020",
      country: "europe",
      budget: 6000000,
      total: 6500000,
      status: "rejected",
    },
  ];

  const filteredLeads = mockLeads.filter((lead) => {
    if (filterCountry !== "all" && lead.country !== filterCountry) return false;
    if (filterStatus !== "all" && lead.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    new: mockLeads.filter((l) => l.status === "new").length,
    inProgress: mockLeads.filter((l) => l.status === "in_progress").length,
    avgBudget: Math.round(
      mockLeads.reduce((sum, l) => sum + l.budget, 0) / mockLeads.length
    ),
    avgTotal: Math.round(
      mockLeads.reduce((sum, l) => sum + l.total, 0) / mockLeads.length
    ),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "Новая";
      case "in_progress":
        return "В работе";
      case "completed":
        return "Завершена";
      case "rejected":
        return "Отклонена";
      default:
        return status;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-bold text-xl text-gray-900">Админ-панель</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link
              to="/admin/leads"
              className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium"
            >
              <Users className="w-5 h-5" />
              Заявки
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <Settings className="w-5 h-5" />
              Настройки
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <BarChart3 className="w-5 h-5" />
              Аналитика
            </button>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              Выход
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Заявки</h1>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Новые заявки</span>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.new}</div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">В работе</span>
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.inProgress}</div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Средний бюджет</span>
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {(stats.avgBudget / 1000000).toFixed(1)}М ₽
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Средняя цена</span>
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {(stats.avgTotal / 1000000).toFixed(1)}М ₽
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Фильтры:</span>
          </div>

          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Все страны</option>
            <option value="korea">Корея</option>
            <option value="china">Китай</option>
            <option value="europe">Европа</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Все статусы</option>
            <option value="new">Новые</option>
            <option value="in_progress">В работе</option>
            <option value="completed">Завершены</option>
            <option value="rejected">Отклонены</option>
          </select>
        </div>

        {/* Table */}
        <div className="flex-1 px-6 pb-6 overflow-auto">
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Клиент
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Авто
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Страна
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Бюджет
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Итого
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действие
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.client}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.car}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {lead.country === "korea" && "Корея"}
                        {lead.country === "china" && "Китай"}
                        {lead.country === "europe" && "Европа"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(lead.budget / 1000000).toFixed(1)}М ₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(lead.total / 1000000).toFixed(1)}М ₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            lead.status
                          )}`}
                        >
                          {getStatusLabel(lead.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/admin/leads/${lead.id}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                          Открыть
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
