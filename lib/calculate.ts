import { z } from "zod";

export const countrySchema = z.enum(["korea", "china", "europe"]);
export const currencySchema = z.enum(["usd", "eur", "cny", "krw"]);
export const engineTypeSchema = z.enum(["gasoline", "diesel", "hybrid", "electric"]);

export const calculationInputSchema = z.object({
  country: countrySchema,
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1990).max(2026),
  engineType: engineTypeSchema,
  engineVolumeLiters: z.coerce.number().min(0).max(8),
  carPrice: z.coerce.number().positive(),
  currency: currencySchema,
  budgetRub: z.coerce.number().positive(),
  destinationCity: z.string().min(1),
  includeCarrier: z.boolean().default(false),
  includeInsurance: z.boolean().default(false),
  includeCertificates: z.boolean().default(false),
  includeBroker: z.boolean().default(false),
  includeDelivery: z.boolean().default(false),
});

export type CalculationInput = z.infer<typeof calculationInputSchema>;
export type Country = z.infer<typeof countrySchema>;
export type Currency = z.infer<typeof currencySchema>;

export type BudgetStatus = "within_budget" | "over_budget";

export type CalculationBreakdown = {
  carPriceRub: number;
  customsFeeRub: number;
  recycleFeeRub: number;
  logisticsRub: number;
  companyFeeRub: number;
  extraCostsRub: number;
  totalRub: number;
  budgetStatus: BudgetStatus;
  budgetDeltaRub: number;
};

export const DEMO_CALCULATION_SETTINGS = {
  disclaimer:
    "Demo settings only. These are not real customs formulas and must be replaced before production use.",
  exchangeRates: {
    usd: 95,
    eur: 105,
    cny: 13,
    krw: 0.072,
  },
  customsDutyRate: 0.15,
  recycleFeeRub: 350_000,
  logisticsByCountryRub: {
    korea: 180_000,
    china: 150_000,
    europe: 320_000,
  },
  companyFeeRate: 0.08,
  companyFixedFeeRub: 50_000,
  extraServicesRub: {
    carrier: 45_000,
    insurance: 25_000,
    certificates: 35_000,
    broker: 60_000,
    delivery: 80_000,
  },
} as const;

const roundRub = (value: number) => Math.round(value);

export function calculateImportCost(input: CalculationInput): CalculationBreakdown {
  const data = calculationInputSchema.parse(input);
  const settings = DEMO_CALCULATION_SETTINGS;

  const carPriceRub = roundRub(data.carPrice * settings.exchangeRates[data.currency]);
  const customsFeeRub = roundRub(carPriceRub * settings.customsDutyRate);
  const recycleFeeRub = settings.recycleFeeRub;
  const logisticsRub = settings.logisticsByCountryRub[data.country];
  const companyFeeRub = roundRub(
    carPriceRub * settings.companyFeeRate + settings.companyFixedFeeRub,
  );

  const extraCostsRub =
    (data.includeCarrier ? settings.extraServicesRub.carrier : 0) +
    (data.includeInsurance ? settings.extraServicesRub.insurance : 0) +
    (data.includeCertificates ? settings.extraServicesRub.certificates : 0) +
    (data.includeBroker ? settings.extraServicesRub.broker : 0) +
    (data.includeDelivery ? settings.extraServicesRub.delivery : 0);

  const totalRub =
    carPriceRub +
    customsFeeRub +
    recycleFeeRub +
    logisticsRub +
    companyFeeRub +
    extraCostsRub;

  return {
    carPriceRub,
    customsFeeRub,
    recycleFeeRub,
    logisticsRub,
    companyFeeRub,
    extraCostsRub,
    totalRub,
    budgetStatus: totalRub <= data.budgetRub ? "within_budget" : "over_budget",
    budgetDeltaRub: roundRub(data.budgetRub - totalRub),
  };
}
