import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import {
  Settings as SettingsIcon,
  Users,
  BarChart3,
  LogOut,
  Save,
  Menu,
  X,
} from "lucide-react";

type SettingsData = {
  exchangeRates: {
    usd: number;
    eur: number;
    cny: number;
    krw: number;
  };
  fees: {
    companyFeePercent: number;
    fixedFee: number;
  };
  logistics: {
    korea: number;
    china: number;
    europe: number;
  };
  customs: {
    dutyRate: number;
    recyclingFee: number;
  };
  services: {
    sbkts: number;
    broker: number;
  };
};

export function Settings() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    exchangeRates: {
      usd: 95,
      eur: 105,
      cny: 13,
      krw: 0.072,
    },
    fees: {
      companyFeePercent: 8,
      fixedFee: 50000,
    },
    logistics: {
      korea: 180000,
      china: 150000,
      europe: 320000,
    },
    customs: {
      dutyRate: 15,
      recyclingFee: 350000,
    },
    services: {
      sbkts: 35000,
      broker: 60000,
    },
  });

  useEffect(() => {
    if (!localStorage.getItem("adminAuth")) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleSave = () => {
    console.log("Settings saved:", settings);
    alert("Настройки сохранены");
  };

  const handleChange = (section: string, field: string, value: number) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [field]: value,
      },
    }));
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
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <Users className="w-5 h-5" />
              Заявки
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium"
            >
              <SettingsIcon className="w-5 h-5" />
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Настройки калькулятора</h1>
          </div>
        </header>

        {/* Settings Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl space-y-6">
            {/* Exchange Rates */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Курсы валют</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    USD → RUB
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.exchangeRates.usd}
                    onChange={(e) =>
                      handleChange("exchangeRates", "usd", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    EUR → RUB
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.exchangeRates.eur}
                    onChange={(e) =>
                      handleChange("exchangeRates", "eur", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNY → RUB
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.exchangeRates.cny}
                    onChange={(e) =>
                      handleChange("exchangeRates", "cny", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KRW → RUB
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={settings.exchangeRates.krw}
                    onChange={(e) =>
                      handleChange("exchangeRates", "krw", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Company Fees */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Комиссия компании</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Процент от стоимости авто (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.fees.companyFeePercent}
                    onChange={(e) =>
                      handleChange("fees", "companyFeePercent", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фиксированная ставка (₽)
                  </label>
                  <input
                    type="number"
                    value={settings.fees.fixedFee}
                    onChange={(e) =>
                      handleChange("fees", "fixedFee", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Logistics */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Стоимость логистики</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Корея (₽)
                  </label>
                  <input
                    type="number"
                    value={settings.logistics.korea}
                    onChange={(e) =>
                      handleChange("logistics", "korea", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Китай (₽)
                  </label>
                  <input
                    type="number"
                    value={settings.logistics.china}
                    onChange={(e) =>
                      handleChange("logistics", "china", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Европа (₽)
                  </label>
                  <input
                    type="number"
                    value={settings.logistics.europe}
                    onChange={(e) =>
                      handleChange("logistics", "europe", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Customs */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Таможенные платежи</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ставка пошлины (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.customs.dutyRate}
                    onChange={(e) =>
                      handleChange("customs", "dutyRate", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Демо-ставка для примера расчёта
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Утилизационный сбор (₽)
                  </label>
                  <input
                    type="number"
                    value={settings.customs.recyclingFee}
                    onChange={(e) =>
                      handleChange("customs", "recyclingFee", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Фиксированная сумма</p>
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Дополнительные услуги</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    СБКТС/ЭПТС (₽)
                  </label>
                  <input
                    type="number"
                    value={settings.services.sbkts}
                    onChange={(e) =>
                      handleChange("services", "sbkts", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Брокер (₽)
                  </label>
                  <input
                    type="number"
                    value={settings.services.broker}
                    onChange={(e) =>
                      handleChange("services", "broker", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                Сохранить настройки
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="font-bold text-yellow-900 mb-2">Важная информация</h3>
              <p className="text-yellow-800 text-sm">
                Это демо-настройки для калькулятора. В реальной системе расчёты производятся
                на основе актуальных таможенных ставок, зависящих от типа, возраста, объёма
                двигателя и других параметров автомобиля. Данные коэффициенты используются
                только для приблизительного расчёта стоимости импорта.
              </p>
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
