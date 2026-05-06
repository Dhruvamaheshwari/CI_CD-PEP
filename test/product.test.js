import { describe, it, expect, vi } from "vitest";
import { getProductById } from "../controllers/productController.js";
import product from "../models/product.js";

vi.mock("../models/product.js");

describe("getProductById", () => {

  // 1. Missing ID
  it("should return error if id is missing", async () => {
    const req = { params: {} };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(402);
  });

  //  2. ID not found
  it("should return error if id not found", async () => {
    const req = { params: { id: "1" } };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    product.findById.mockResolvedValue(null);

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(402);
  });

  //  3. Success case
  it("should return product if id exists", async () => {
    const req = { params: { id: "1" } };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    const fakeData = { _id: "1", name: "Phone" };

    product.findById
      .mockResolvedValueOnce(fakeData)
      .mockResolvedValueOnce(fakeData);

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

});