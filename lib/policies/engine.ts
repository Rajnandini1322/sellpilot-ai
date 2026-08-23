import { POLICY_LIMITS } from "./limits";
import {
  PolicyDecisionSchema,
  PurchaseRequestSchema,
  type PolicyDecision,
  type PurchaseRequest,
} from "./schema";

export type PolicyProduct = {
  id: string;
  name: string;
  price: number;
  inventory: number;
  active: boolean;
};

export function evaluatePurchasePolicy(
  input: PurchaseRequest,
  product: PolicyProduct | null,
): PolicyDecision {
  const request = PurchaseRequestSchema.parse(input);

  const checks: PolicyDecision["checks"] = [];

  // Product existence
  if (!product) {
    checks.push({
      name: "PRODUCT_EXISTS",
      passed: false,
      reason: "Product does not exist.",
    });

    return PolicyDecisionSchema.parse({
      decision: "BLOCK",
      allowed: false,
      reason: "Purchase blocked because the product does not exist.",
      checks,
    });
  }

  checks.push({
    name: "PRODUCT_EXISTS",
    passed: true,
    reason: "Product exists.",
  });

  // Product active
  if (!product.active) {
    checks.push({
      name: "PRODUCT_ACTIVE",
      passed: false,
      reason: "Product is inactive.",
    });

    return PolicyDecisionSchema.parse({
      decision: "BLOCK",
      allowed: false,
      reason: "Purchase blocked because this product is inactive.",
      checks,
    });
  }

  checks.push({
    name: "PRODUCT_ACTIVE",
    passed: true,
    reason: "Product is active.",
  });

  // Inventory
  if (product.inventory <= 0) {
    checks.push({
      name: "INVENTORY_AVAILABLE",
      passed: false,
      reason: "Product is out of stock.",
    });

    return PolicyDecisionSchema.parse({
      decision: "BLOCK",
      allowed: false,
      reason: "Purchase blocked because the product is out of stock.",
      checks,
    });
  }

  checks.push({
    name: "INVENTORY_AVAILABLE",
    passed: true,
    reason: `Inventory available: ${product.inventory}.`,
  });

  // Requested quantity vs inventory
  if (request.quantity > product.inventory) {
    checks.push({
      name: "REQUESTED_QUANTITY_AVAILABLE",
      passed: false,
      reason: `Only ${product.inventory} units are available.`,
    });

    return PolicyDecisionSchema.parse({
      decision: "BLOCK",
      allowed: false,
      reason:
        "Purchase blocked because the requested quantity is unavailable.",
      checks,
    });
  }

  checks.push({
    name: "REQUESTED_QUANTITY_AVAILABLE",
    passed: true,
    reason: "Requested quantity is available.",
  });

  // Maximum quantity
  if (request.quantity > POLICY_LIMITS.MAX_QUANTITY) {
    checks.push({
      name: "MAX_QUANTITY",
      passed: false,
      reason: `Maximum allowed quantity is ${POLICY_LIMITS.MAX_QUANTITY}.`,
    });

    return PolicyDecisionSchema.parse({
      decision: "BLOCK",
      allowed: false,
      reason: `Purchase blocked because maximum allowed quantity is ${POLICY_LIMITS.MAX_QUANTITY}.`,
      checks,
    });
  }

  checks.push({
    name: "MAX_QUANTITY",
    passed: true,
    reason: `Quantity is within the limit of ${POLICY_LIMITS.MAX_QUANTITY}.`,
  });

  // Price validation
  if (product.price <= 0) {
    checks.push({
      name: "VALID_PRICE",
      passed: false,
      reason: "Product price is invalid.",
    });

    return PolicyDecisionSchema.parse({
      decision: "BLOCK",
      allowed: false,
      reason: "Purchase blocked because the product price is invalid.",
      checks,
    });
  }

  checks.push({
    name: "VALID_PRICE",
    passed: true,
    reason: "Product price is valid.",
  });

  // Total amount
  const totalAmountPaise = product.price * request.quantity;

  if (
    totalAmountPaise >
    POLICY_LIMITS.MAX_TRANSACTION_AMOUNT_PAISE
  ) {
    checks.push({
      name: "MAX_TRANSACTION_AMOUNT",
      passed: false,
      reason: `Transaction exceeds the maximum allowed amount of ₹${
        POLICY_LIMITS.MAX_TRANSACTION_AMOUNT_PAISE / 100
      }.`,
    });

    return PolicyDecisionSchema.parse({
      decision: "BLOCK",
      allowed: false,
      reason:
        "Purchase blocked because the transaction exceeds the allowed spending limit.",
      checks,
    });
  }

  checks.push({
    name: "MAX_TRANSACTION_AMOUNT",
    passed: true,
    reason: "Transaction is within the allowed spending limit.",
  });

  // IMPORTANT:
  // Passing policy checks NEVER means payment is authorized.
  // Explicit customer approval will be required later.
  return PolicyDecisionSchema.parse({
    decision: "REQUIRE_APPROVAL",
    allowed: false,
    reason:
      "Purchase passed policy checks and requires explicit customer approval before payment.",
    checks,
  });
}