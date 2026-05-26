import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { CheckCircle, XCircle, Sparkles, ArrowRight } from "lucide-react";

export function CalculationResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData;
  const [showAIExplanation, setShowAIExplanation] = useState(false);

  if (!formData) {
    navigate("/");
    return null;
  }

  const exchangeRates: Record<string, number> = {
    usd: 95,
    eur: 105,
    cny: 13,
    krw: 0.072,
  };

  const priceInRub = parseFloat(formData.price) * exchangeRates[formData.currency];
  const customsDuty = priceInRub * 0.15;
  const recyclingFee = 350000;

  const logisticsCost: Record<string, number> = {
    korea: 180000,
    china: 150000,
    europe: 320000,
  };

  const logistics = logisticsCost[formData.country];
  const companyFee = priceInRub * 0.08 + 50000;

  let additionalCosts = 0;
  if (formData.includeCarrier) additionalCosts += 45000;
  if (formData.includeInsurance) additionalCosts += 25000;
  if (formData.includeCertificates) additionalCosts += 35000;
  if (formData.includeBroker) additionalCosts += 60000;
  if (formData.includeDelivery) additionalCosts += 80000;

  const total = priceInRub + customsDuty + recyclingFee + logistics + companyFee + additionalCosts;
  const budget = parseFloat(formData.budget);
  const withinBudget = total <= budget;

  const breakdown = [
    { label: "Стоимость авто в рублях", value: priceInRub },
    { label: "Пошлина", value: customsDuty },
    { label: "Утилизационный сбор", value: recyclingFee },
    { label: "Логистика", value: logistics },
    { label: "Комиссия компании", value: companyFee },
    { label: "Дополнительные расходы", value: additionalCosts },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 md:p-8 text-white">
            <h1 className="text-3xl font-bold mb-4">Расчёт стоимости</h1>
            <div className="flex items-center gap-3 text-lg">
              <span className="opacity-90">
                {formData.brand} {formData.model} {formData.year}
              </span>
              <span className="opacity-70">•</span>
              <span className="opacity-90 capitalize">
                {formData.country === "korea" && "Корея"}
                {formData.country === "china" && "Китай"}
                {formData.country === "europe" && "Европа"}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Итого под ключ</h2>
                {withinBudget ? (
                  <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">В бюджете</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-lg">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Не проходит</span>
                  </div>
                )}
              </div>
              <div className="text-4xl font-bold text-blue-600">
                {total.toLocaleString("ru-RU")} ₽
              </div>
              <div className="text-gray-600 mt-2">
                Ваш бюджет: {budget.toLocaleString("ru-RU")} ₽
                {!withinBudget && (
                  <span className="text-red-600 ml-2">
                    (превышение на {(total - budget).toLocaleString("ru-RU")} ₽)
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-8">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Детализация расчёта</h3>
              <div className="space-y-3">
                {breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-medium text-gray-900">
                      {item.value.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Итого</span>
                  <span className="font-bold text-xl text-blue-600">
                    {total.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">AI-объяснение расчёта</h4>
                  {!showAIExplanation ? (
                    <button
                      onClick={() => setShowAIExplanation(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Объяснить расчёт простыми словами
                    </button>
                  ) : (
                    <div className="text-gray-700 space-y-2">
                      <p>
                        Основная часть стоимости — это цена автомобиля ({priceInRub.toLocaleString("ru-RU")} ₽)
                        и таможенные платежи ({(customsDuty + recyclingFee).toLocaleString("ru-RU")} ₽).
                      </p>
                      <p>
                        Пошлина составляет 15% от стоимости авто, а утилизационный сбор — фиксированные
                        350 000 ₽ для легковых автомобилей.
                      </p>
                      <p>
                        Логистика из {formData.country === "korea" ? "Кореи" : formData.country === "china" ? "Китая" : "Европы"}
                        {" "}обойдётся в {logistics.toLocaleString("ru-RU")} ₽,
                        а наша комиссия (8% + 50 000 ₽) — {companyFee.toLocaleString("ru-RU")} ₽.
                      </p>
                      {additionalCosts > 0 && (
                        <p>
                          Дополнительные услуги добавляют ещё {additionalCosts.toLocaleString("ru-RU")} ₽
                          к общей стоимости.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h4 className="font-bold text-gray-900 mb-2">
                Хотите точный расчёт по реальным ставкам?
              </h4>
              <p className="text-gray-700 mb-4">
                Это демо-расчёт с приблизительными коэффициентами.
                Для получения точного расчёта и помощи в импорте оставьте заявку.
              </p>
              <Link
                to="/lead-form"
                state={{ formData, calculatedTotal: total }}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Оставить заявку
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
