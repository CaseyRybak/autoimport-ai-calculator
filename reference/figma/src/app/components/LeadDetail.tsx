import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  User,
  Phone,
  MessageCircle,
  Car,
  DollarSign,
  FileText,
  Sparkles,
  Send,
} from "lucide-react";

type Lead = {
  id: string;
  date: string;
  client: {
    name: string;
    phone: string;
    telegram: string;
  };
  car: {
    brand: string;
    model: string;
    year: string;
    engineType: string;
    engineVolume: string;
  };
  country: string;
  budget: number;
  total: number;
  status: "new" | "in_progress" | "completed" | "rejected";
  comment: string;
  breakdown: {
    carPrice: number;
    customsDuty: number;
    recyclingFee: number;
    logistics: number;
    companyFee: number;
    additionalCosts: number;
  };
};

export function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [status, setStatus] = useState("");
  const [managerComment, setManagerComment] = useState("");
  const [showAISummary, setShowAISummary] = useState(false);
  const [showGeneratedMessage, setShowGeneratedMessage] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("adminAuth")) {
      navigate("/admin");
      return;
    }

    const mockLead: Lead = {
      id: id || "1",
      date: "26.05.2026 14:30",
      client: {
        name: "Иван Петров",
        phone: "+7 (999) 123-45-67",
        telegram: "@ivan_petrov",
      },
      car: {
        brand: "Toyota",
        model: "Camry",
        year: "2022",
        engineType: "Бензин",
        engineVolume: "2.5",
      },
      country: "korea",
      budget: 3000000,
      total: 2850000,
      status: "new",
      comment: "Хочу быстро оформить, интересует срок доставки",
      breakdown: {
        carPrice: 2280000,
        customsDuty: 342000,
        recyclingFee: 350000,
        logistics: 180000,
        companyFee: 232400,
        additionalCosts: 145600,
      },
    };

    setLead(mockLead);
    setStatus(mockLead.status);
  }, [id, navigate]);

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  const handleStatusChange = () => {
    setLead({ ...lead, status: status as any });
    alert("Статус обновлён");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/leads"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Заявка #{lead.id}</h1>
              <p className="text-gray-600 text-sm">{lead.date}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Информация о клиенте</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Имя</label>
                  <p className="text-gray-900 font-medium">{lead.client.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Телефон</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900 font-medium">{lead.client.phone}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Telegram</label>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900 font-medium">{lead.client.telegram}</p>
                  </div>
                </div>
              </div>
              {lead.comment && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="text-sm font-medium text-blue-900 mb-1 block">
                    Комментарий клиента
                  </label>
                  <p className="text-blue-800">{lead.comment}</p>
                </div>
              )}
            </div>

            {/* Car Info */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <Car className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Информация об автомобиле</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Марка и модель</label>
                  <p className="text-gray-900 font-medium">
                    {lead.car.brand} {lead.car.model}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Год выпуска</label>
                  <p className="text-gray-900 font-medium">{lead.car.year}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Тип двигателя</label>
                  <p className="text-gray-900 font-medium">{lead.car.engineType}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Объём двигателя</label>
                  <p className="text-gray-900 font-medium">{lead.car.engineVolume} л</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Страна покупки</label>
                  <p className="text-gray-900 font-medium capitalize">
                    {lead.country === "korea" && "Корея"}
                    {lead.country === "china" && "Китай"}
                    {lead.country === "europe" && "Европа"}
                  </p>
                </div>
              </div>
            </div>

            {/* Calculation Breakdown */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Детализация расчёта</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Стоимость авто в рублях</span>
                  <span className="font-medium text-gray-900">
                    {lead.breakdown.carPrice.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Пошлина</span>
                  <span className="font-medium text-gray-900">
                    {lead.breakdown.customsDuty.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Утилизационный сбор</span>
                  <span className="font-medium text-gray-900">
                    {lead.breakdown.recyclingFee.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Логистика</span>
                  <span className="font-medium text-gray-900">
                    {lead.breakdown.logistics.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Комиссия компании</span>
                  <span className="font-medium text-gray-900">
                    {lead.breakdown.companyFee.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Дополнительные расходы</span>
                  <span className="font-medium text-gray-900">
                    {lead.breakdown.additionalCosts.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Итого</span>
                  <span className="font-bold text-xl text-blue-600">
                    {lead.total.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Бюджет клиента</span>
                  <span className="text-gray-900">{lead.budget.toLocaleString("ru-RU")} ₽</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Разница</span>
                  <span
                    className={
                      lead.total <= lead.budget ? "text-green-600" : "text-red-600"
                    }
                  >
                    {lead.total <= lead.budget ? "В бюджете" : "Превышение"}{" "}
                    {Math.abs(lead.budget - lead.total).toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">AI-анализ</h2>
              </div>
              {!showAISummary ? (
                <button
                  onClick={() => setShowAISummary(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Сформировать summary
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Резюме заявки</h4>
                    <p className="text-blue-800 text-sm">
                      Клиент заинтересован в покупке Toyota Camry 2022 из Кореи. Расчётная
                      стоимость ({lead.total.toLocaleString("ru-RU")} ₽) укладывается в бюджет
                      клиента ({lead.budget.toLocaleString("ru-RU")} ₽) с запасом{" "}
                      {(lead.budget - lead.total).toLocaleString("ru-RU")} ₽. Клиент
                      интересуется сроками доставки, что указывает на срочность сделки.
                      Рекомендуется связаться в ближайшее время для уточнения деталей.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Рекомендации</h4>
                    <ul className="text-green-800 text-sm space-y-1 list-disc list-inside">
                      <li>Приоритетная обработка — клиент заинтересован в быстром оформлении</li>
                      <li>Подготовить информацию о сроках доставки из Кореи</li>
                      <li>
                        Предложить дополнительные услуги в рамках оставшегося бюджета (150 000 ₽)
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Статус заявки</h3>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              >
                <option value="new">Новая</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Завершена</option>
                <option value="rejected">Отклонена</option>
              </select>
              <button
                onClick={handleStatusChange}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Обновить статус
              </button>
            </div>

            {/* Manager Comments */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Комментарий менеджера</h3>
              </div>
              <textarea
                value={managerComment}
                onChange={(e) => setManagerComment(e.target.value)}
                placeholder="Добавьте комментарий к заявке..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              />
              <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                Сохранить комментарий
              </button>
            </div>

            {/* Generate Message */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Send className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Сообщение клиенту</h3>
              </div>
              {!showGeneratedMessage ? (
                <button
                  onClick={() => setShowGeneratedMessage(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Сгенерировать сообщение
                </button>
              ) : (
                <div className="space-y-4">
                  <textarea
                    defaultValue={`Добрый день, ${lead.client.name}!

Спасибо за вашу заявку на импорт ${lead.car.brand} ${lead.car.model} ${lead.car.year} из Кореи.

Мы рассчитали стоимость: ${lead.total.toLocaleString("ru-RU")} ₽ под ключ, что полностью укладывается в ваш бюджет.

Срок доставки из Кореи составляет 30-45 дней. Готовы ответить на все ваши вопросы!`}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Скопировать
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
