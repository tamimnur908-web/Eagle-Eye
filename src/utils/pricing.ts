import { Service, DigitalProduct } from '../types';

/**
 * Returns a standardized pricing representation for Agency Services.
 *
 * Rules:
 * 1. If valid numeric price > 0, returns formatted exact price.
 * 2. If empty, null, undefined, zero or negative, returns "Price on Request" (or custom label).
 * 3. Never invents prices or defaults to random numbers.
 */
export function getServicePricingDisplay(
  service: Partial<Service> | null | undefined,
  currencySymbol: string = '৳',
  fallbackText: string = 'Price on Request'
): {
  displayText: string;
  hasExactPrice: boolean;
  numericPrice: number | null;
  subtext: string;
  isPriceOnRequest: boolean;
} {
  if (!service) {
    return {
      displayText: fallbackText,
      hasExactPrice: false,
      numericPrice: null,
      subtext: "Let's Discuss Your Requirements",
      isPriceOnRequest: true,
    };
  }

  const rawPrice = service.price;

  if (
    rawPrice !== undefined &&
    rawPrice !== null &&
    rawPrice !== ('' as any) &&
    !isNaN(Number(rawPrice)) &&
    Number(rawPrice) > 0
  ) {
    const num = Number(rawPrice);
    const billingSuffix =
      service.pricingType === 'monthly'
        ? '/ month'
        : service.pricingType === 'custom'
        ? '(Starting)'
        : '';

    return {
      displayText: `${currencySymbol}${num.toLocaleString()}${billingSuffix ? ` ${billingSuffix}` : ''}`,
      hasExactPrice: true,
      numericPrice: num,
      subtext: billingSuffix ? 'Billed monthly' : 'Fixed engagement scope',
      isPriceOnRequest: false,
    };
  }

  return {
    displayText: fallbackText,
    hasExactPrice: false,
    numericPrice: null,
    subtext: "Let's Discuss Your Requirements",
    isPriceOnRequest: true,
  };
}

/**
 * Returns a standardized pricing representation for Digital Products.
 *
 * Rules:
 * 1. If valid price is set and > 0, display exact price (or sale price).
 * 2. If product price is empty, removed, or explicitly unset, display "Free".
 * 3. A genuinely free product (isFree: true or price: 0) is displayed as "Free".
 */
export function getProductPricingDisplay(
  product: Partial<DigitalProduct> | null | undefined,
  currencySymbol: string = '৳'
): {
  displayText: string;
  isFree: boolean;
  hasDiscount: boolean;
  regularPrice: number | null;
  salePrice: number | null;
} {
  if (!product) {
    return {
      displayText: 'Free',
      isFree: true,
      hasDiscount: false,
      regularPrice: 0,
      salePrice: null,
    };
  }

  // Explicitly free or unset price
  const isExplicitFree = product.isFree === true;
  const rawPrice = product.price;

  if (
    isExplicitFree ||
    rawPrice === undefined ||
    rawPrice === null ||
    rawPrice === ('' as any) ||
    isNaN(Number(rawPrice)) ||
    Number(rawPrice) === 0
  ) {
    return {
      displayText: 'Free',
      isFree: true,
      hasDiscount: false,
      regularPrice: 0,
      salePrice: null,
    };
  }

  const priceNum = Number(rawPrice);
  const saleNum =
    product.salePrice !== undefined &&
    product.salePrice !== null &&
    !isNaN(Number(product.salePrice)) &&
    Number(product.salePrice) < priceNum
      ? Number(product.salePrice)
      : null;

  if (saleNum !== null) {
    return {
      displayText: `${currencySymbol}${saleNum.toLocaleString()}`,
      isFree: false,
      hasDiscount: true,
      regularPrice: priceNum,
      salePrice: saleNum,
    };
  }

  return {
    displayText: `${currencySymbol}${priceNum.toLocaleString()}`,
    isFree: false,
    hasDiscount: false,
    regularPrice: priceNum,
    salePrice: null,
  };
}
