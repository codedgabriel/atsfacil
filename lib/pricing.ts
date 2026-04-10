export const PIX_PRICE_AMOUNT = 1.9;

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

export function formatPriceBRL(value = PIX_PRICE_AMOUNT) {
  return brlFormatter.format(value);
}
