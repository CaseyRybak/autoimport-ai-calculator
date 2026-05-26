import { useState } from "react";
import { useLocation } from "react-router";
import { Send, CheckCircle } from "lucide-react";

export function LeadForm() {
  const location = useLocation();
  const formData = location.state?.formData;
  const calculatedTotal = location.state?.calculatedTotal;

  const [leadData, setLeadData] = useState({
    name: "",
    phone: "",
    telegram: "",
    comment: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Lead submitted:", { ...leadData, formData, calculatedTotal });
    setSubmitted(true);
  };

  const handleChange = (field: string, value: string) => {
    setLeadData((prev) => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Заявка отправлена!</h2>
          <p className="text-gray-600 mb-6">
            Спасибо за обращение. Наш менеджер свяжется с вами в ближайшее время.
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться на главную
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Оставить заявку</h1>
          <p className="text-gray-600">
            Заполните форму, и наш менеджер свяжется с вами для точного расчёта
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {formData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Ваш расчёт</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <strong>Автомобиль:</strong> {formData.brand} {formData.model} {formData.year}
                </p>
                <p>
                  <strong>Страна:</strong>{" "}
                  {formData.country === "korea" && "Корея"}
                  {formData.country === "china" && "Китай"}
                  {formData.country === "europe" && "Европа"}
                </p>
                <p>
                  <strong>Бюджет:</strong> {parseFloat(formData.budget).toLocaleString("ru-RU")} ₽
                </p>
                {calculatedTotal && (
                  <p>
                    <strong>Расчётная стоимость:</strong>{" "}
                    {calculatedTotal.toLocaleString("ru-RU")} ₽
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имя <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={leadData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Иван Иванов"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={leadData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+7 (999) 123-45-67"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telegram
              </label>
              <input
                type="text"
                value={leadData.telegram}
                onChange={(e) => handleChange("telegram", e.target.value)}
                placeholder="@username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комментарий
              </label>
              <textarea
                value={leadData.comment}
                onChange={(e) => handleChange("comment", e.target.value)}
                placeholder="Дополнительная информация или вопросы..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Отправить заявку
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
