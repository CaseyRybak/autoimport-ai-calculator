import { useState } from "react";
import { useNavigate } from "react-router";
import { Calculator as CalcIcon, ArrowRight } from "lucide-react";

export function Calculator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    country: "korea",
    brand: "",
    model: "",
    year: "",
    engineType: "gasoline",
    engineVolume: "",
    price: "",
    currency: "usd",
    budget: "",
    city: "",
    includeCarrier: false,
    includeInsurance: false,
    includeCertificates: false,
    includeBroker: false,
    includeDelivery: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/result", { state: { formData } });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Рассчитайте стоимость авто под ключ
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Демо-калькулятор импорта авто из Кореи, Китая и Европы
          </p>
          <button
            onClick={() => document.getElementById("calculator-form")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Рассчитать стоимость
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div id="calculator-form" className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <CalcIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Калькулятор стоимости</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Страна покупки
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="korea">Корея</option>
                  <option value="china">Китай</option>
                  <option value="europe">Европа</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Марка
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  placeholder="Например: Toyota"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Модель
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  placeholder="Например: Camry"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Год выпуска
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleChange("year", e.target.value)}
                  placeholder="2020"
                  min="2000"
                  max="2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип двигателя
                </label>
                <select
                  value={formData.engineType}
                  onChange={(e) => handleChange("engineType", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="gasoline">Бензин</option>
                  <option value="diesel">Дизель</option>
                  <option value="hybrid">Гибрид</option>
                  <option value="electric">Электро</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Объём двигателя (л)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.engineVolume}
                  onChange={(e) => handleChange("engineVolume", e.target.value)}
                  placeholder="2.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Стоимость авто за рубежом
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="25000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Валюта
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="cny">CNY</option>
                  <option value="krw">KRW</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Бюджет клиента (₽)
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  placeholder="3000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Город доставки
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Москва"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="font-medium text-gray-900 mb-4">Дополнительные услуги</p>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeCarrier}
                    onChange={(e) => handleChange("includeCarrier", e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Автовоз</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeInsurance}
                    onChange={(e) => handleChange("includeInsurance", e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Страховка</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeCertificates}
                    onChange={(e) => handleChange("includeCertificates", e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">СБКТС/ЭПТС</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeBroker}
                    onChange={(e) => handleChange("includeBroker", e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Брокер</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeDelivery}
                    onChange={(e) => handleChange("includeDelivery", e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Доставка до города</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Рассчитать
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
