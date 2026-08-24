import { describe, expect, it } from "vitest";
import { evaluatePurchasePolicy } from "../lib/policies/engine";

const activeProduct = {
  id: "prod_keyboard",
  name: "Mechanical Keyboard",
  price: 249900,
  inventory: 10,
  active: true,
};

const request = {
  sessionId: "demo-session",
  productId: "prod_keyboard",
  quantity: 1,
  requestedAt: new Date().toISOString(),
};

describe("Purchase Policy Engine", () => {
  it("requires approval for a valid purchase", () => {
    const result = evaluatePurchasePolicy(
      request,
      activeProduct,
    );

    expect(result.decision).toBe("REQUIRE_APPROVAL");
    expect(result.allowed).toBe(false);
  });

  it("blocks a missing product", () => {
    const result = evaluatePurchasePolicy(request, null);

    expect(result.decision).toBe("BLOCK");
    expect(result.reason).toContain("does not exist");
  });

  it("blocks an inactive product", () => {
    const result = evaluatePurchasePolicy(request, {
      ...activeProduct,
      active: false,
    });

    expect(result.decision).toBe("BLOCK");
  });

  it("blocks an out-of-stock product", () => {
    const result = evaluatePurchasePolicy(request, {
      ...activeProduct,
      inventory: 0,
    });

    expect(result.decision).toBe("BLOCK");
  });

  it("blocks quantity greater than inventory", () => {
    const result = evaluatePurchasePolicy(
      {
        ...request,
        quantity: 11,
      },
      activeProduct,
    );

    expect(result.decision).toBe("BLOCK");
  });

  it("blocks quantity above policy limit", () => {
    const result = evaluatePurchasePolicy(
      {
        ...request,
        quantity: 6,
      },
      {
        ...activeProduct,
        inventory: 20,
      },
    );

    expect(result.decision).toBe("BLOCK");
  });

  it("blocks transaction above spending limit", () => {
    const result = evaluatePurchasePolicy(
      {
        ...request,
        quantity: 5,
      },
      {
        ...activeProduct,
        price: 1250000,
        inventory: 10,
      },
    );

    expect(result.decision).toBe("BLOCK");
  });

  it("blocks invalid price", () => {
    const result = evaluatePurchasePolicy(
      request,
      {
        ...activeProduct,
        price: 0,
      },
    );

    expect(result.decision).toBe("BLOCK");
  });

  it("returns explainable policy checks", () => {
    const result = evaluatePurchasePolicy(
      request,
      activeProduct,
    );

    expect(result.checks.length).toBeGreaterThan(0);

    for (const check of result.checks) {
      expect(check.name).toBeTruthy();
      expect(typeof check.passed).toBe("boolean");
      expect(check.reason).toBeTruthy();
    }
  });
});
