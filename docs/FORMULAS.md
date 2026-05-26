# Demo Formulas

Важно: формулы в MVP являются демонстрационными. Они не являются реальными
таможенными расчетами и не должны использоваться для коммерческого расчета.

## Demo Settings

- USD: 95 RUB
- EUR: 105 RUB
- CNY: 13 RUB
- KRW: 0.072 RUB
- Demo customs fee: 15% от рублевой цены авто
- Demo recycle fee: 350 000 RUB
- Company fee: 8% от рублевой цены авто + 50 000 RUB

## Logistics

- Korea: 180 000 RUB
- China: 150 000 RUB
- Europe: 320 000 RUB

## Extra Services

- Carrier: 45 000 RUB
- Insurance: 25 000 RUB
- Certificates: 35 000 RUB
- Broker: 60 000 RUB
- City delivery: 80 000 RUB

## Output

`calculateImportCost` возвращает:

- `carPriceRub`
- `customsFeeRub`
- `recycleFeeRub`
- `logisticsRub`
- `companyFeeRub`
- `extraCostsRub`
- `totalRub`
- `budgetStatus`
- `budgetDeltaRub`
