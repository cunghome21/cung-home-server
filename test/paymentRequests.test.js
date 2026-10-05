import test from "node:test";
import assert from "node:assert/strict";
import PaymentRequest from "../models/paymentRequest.js";
import { adminJson, publicJson, validateCreate } from "../routes/paymentRequests.js";
import { PAYMENT_ACCOUNT } from "../config/paymentAccount.js";

const valid = {
  customerName: "Nguyễn Văn A",
  amountVnd: 20780000,
  transferContent: "Cọc 6 sofa Bubble - 1 sofa Bí Ngô",
};

test("validates payment creation input and rejects client-controlled fields", () => {
  assert.equal(validateCreate(valid), null);
  assert.match(validateCreate({ ...valid, amountVnd: 0 }), /Số tiền/);
  assert.match(validateCreate({ ...valid, amountVnd: -1 }), /Số tiền/);
  assert.match(validateCreate({ ...valid, amountVnd: "20780000" }), /Số tiền/);
  assert.match(validateCreate({ ...valid, transferContent: "   " }), /Nội dung/);
  assert.match(validateCreate({ ...valid, status: "received" }), /không được phép/);
  assert.match(validateCreate({ ...valid, bank: {} }), /không được phép/);
});

test("model enforces amount and status without connecting to MongoDB", async () => {
  const base = {
    publicId: "a".repeat(48), code: "PC-AAAAAAAAAAAA", ...valid,
    bank: PAYMENT_ACCOUNT, idempotencyKey: "request-key-123456",
    payloadHash: "b".repeat(64), createdBy: "admin",
  };
  await assert.doesNotReject(() => new PaymentRequest(base).validate());
  await assert.rejects(() => new PaymentRequest({ ...base, amountVnd: 0 }).validate(), /amountVnd/);
  await assert.rejects(() => new PaymentRequest({ ...base, status: "paid-by-customer" }).validate(), /status/);
});

test("public response exposes only payment fields", () => {
  const doc = {
    publicId: "a".repeat(48), code: "PC-AAAAAAAAAAAA", ...valid,
    bank: PAYMENT_ACCOUNT, status: "pending", orderId: null,
    createdAt: new Date(), updatedAt: new Date(), createdBy: "admin",
    idempotencyKey: "secret", payloadHash: "secret-hash",
  };
  assert.deepEqual(Object.keys(publicJson(doc)).sort(), ["amountVnd", "bank", "code", "id", "status", "transferContent"]);
  assert.equal(publicJson(doc).customerName, undefined);
  assert.equal(publicJson(doc).idempotencyKey, undefined);
  assert.equal(adminJson(doc).customerName, valid.customerName);
});
