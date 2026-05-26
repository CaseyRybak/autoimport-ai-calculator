import { Calculator, FileText, TrendingUp, CheckCircle } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Calculator,
      title: "1. Введите данные",
      description: "Укажите параметры автомобиля, который хотите импортировать: марку, модель, год, страну покупки.",
    },
    {
      icon: TrendingUp,
      title: "2. Получите расчёт",
      description: "Система рассчитает приблизительную стоимость с учётом пошлин, сборов, логистики и дополнительных услуг.",
    },
    {
      icon: FileText,
      title: "3. Оставьте заявку",
      description: "Если расчёт вас устроил, оставьте заявку для получения точного предложения от менеджера.",
    },
    {
      icon: CheckCircle,
      title: "4. Получите помощь",
      description: "Наш менеджер свяжется с вами, уточнит детали и поможет организовать импорт автомобиля под ключ.",
    },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Как работает калькулятор</h1>
          <p className="text-xl text-gray-600">
            Простой процесс расчёта стоимости импорта автомобиля
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Что входит в расчёт?</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Стоимость автомобиля</strong> — цена за рубежом в рублях по актуальному курсу
            </p>
            <p>
              <strong>Таможенная пошлина</strong> — зависит от типа, возраста и объёма двигателя
            </p>
            <p>
              <strong>Утилизационный сбор</strong> — фиксированная государственная пошлина
            </p>
            <p>
              <strong>Логистика</strong> — доставка из страны покупки до России
            </p>
            <p>
              <strong>Комиссия компании</strong> — наше вознаграждение за организацию импорта
            </p>
            <p>
              <strong>Дополнительные услуги</strong> — автовоз, страховка, оформление документов и т.д.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
