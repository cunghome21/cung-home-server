import crypto from "crypto";
import express from "express";
import PaymentRequest from "../models/paymentRequest.js";
import { PAYMENT_ACCOUNT } from "../config/paymentAccount.js";

const MAX_AMOUNT = 999999999999;
const PUBLIC_ID_RE = /^[a-f0-9]{48}$/;
const IDEMPOTENCY_RE = /^[A-Za-z0-9_-]{16,128}$/;
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const noStore = (_req, res, next) => { res.set("Cache-Control", "no-store"); next(); };

export function adminJson(doc) {
  return {
    id: doc.publicId,
    code: doc.code,
    customerName: doc.customerName,
    orderId: doc.orderId ?? null,
    amountVnd: doc.amountVnd,
    transferContent: doc.transferContent,
    bank: doc.bank,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
  };
}

export function publicJson(doc) {
  return {
    id: doc.publicId,
    code: doc.code,
    amountVnd: doc.amountVnd,
    transferContent: doc.transferContent,
    bank: doc.bank,
    status: doc.status,
  };
}

export function validateCreate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Dữ liệu phiếu không hợp lệ.";
  const allowed = new Set(["customerName", "amountVnd", "transferContent"]);
  if (Object.keys(body).some((key) => !allowed.has(key))) return "Phiếu chứa trường dữ liệu không được phép.";
  if (typeof body.customerName !== "string" || !body.customerName.trim() || body.customerName.length > 200) return "Tên khách hàng không hợp lệ.";
  if (!Number.isSafeInteger(body.amountVnd) || body.amountVnd < 1 || body.amountVnd > MAX_AMOUNT) return "Số tiền cọc không hợp lệ.";
  if (typeof body.transferContent !== "string" || !body.transferContent.trim() || body.transferContent.length > 500) return "Nội dung chuyển khoản không hợp lệ.";
  return null;
}

export const adminPaymentRouter = express.Router();
adminPaymentRouter.use(noStore);

adminPaymentRouter.get("/settings", (_req, res) => res.json({ bank: PAYMENT_ACCOUNT }));

adminPaymentRouter.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = 20;
    const search = String(req.query.search || "").trim().slice(0, 200);
    const query = search ? { $or: [
      { customerName: { $regex: escapeRegex(search), $options: "i" } },
      { code: { $regex: escapeRegex(search), $options: "i" } },
      { transferContent: { $regex: escapeRegex(search), $options: "i" } },
    ] } : {};
    const [items, total] = await Promise.all([
      PaymentRequest.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      PaymentRequest.countDocuments(query),
    ]);
    res.json({ items: items.map(adminJson), page, total, limit });
  } catch (error) {
    console.error("Payment request list failed:", error.message);
    res.status(500).json({ error: "Không tải được danh sách phiếu cọc." });
  }
});

adminPaymentRouter.post("/", async (req, res) => {
  const validationError = validateCreate(req.body);
  const idempotencyKey = req.get("Idempotency-Key") || "";
  if (validationError) return res.status(400).json({ error: validationError });
  if (!IDEMPOTENCY_RE.test(idempotencyKey)) return res.status(400).json({ error: "Thiếu khóa chống tạo trùng hợp lệ." });

  const customerName = req.body.customerName.trim();
  const payloadHash = crypto.createHash("sha256").update(JSON.stringify({
    customerName,
    amountVnd: req.body.amountVnd,
    transferContent: req.body.transferContent,
  })).digest("hex");

  try {
    // Ensure the unique idempotency index exists before accepting concurrent writes.
    await PaymentRequest.init();
    const existing = await PaymentRequest.findOne({ idempotencyKey }).select("+payloadHash");
    if (existing) {
      if (existing.payloadHash !== payloadHash) return res.status(409).json({ error: "Khóa tạo phiếu đã được dùng cho nội dung khác." });
      return res.json(adminJson(existing));
    }
    const publicId = crypto.randomBytes(24).toString("hex");
    const item = await PaymentRequest.create({
      publicId,
      code: `PC-${publicId.slice(0, 12).toUpperCase()}`,
      customerName,
      orderId: null,
      amountVnd: req.body.amountVnd,
      transferContent: req.body.transferContent,
      bank: { ...PAYMENT_ACCOUNT },
      status: "pending",
      createdBy: "admin",
      idempotencyKey,
      payloadHash,
    });
    return res.status(201).json(adminJson(item));
  } catch (error) {
    if (error?.code === 11000) {
      const existing = await PaymentRequest.findOne({ idempotencyKey }).select("+payloadHash");
      if (existing && existing.payloadHash === payloadHash) return res.json(adminJson(existing));
      if (existing) return res.status(409).json({ error: "Khóa tạo phiếu đã được dùng cho nội dung khác." });
    }
    console.error("Payment request creation failed:", error.message);
    return res.status(500).json({ error: "Không tạo được phiếu cọc." });
  }
});

adminPaymentRouter.patch("/:id/status", async (req, res) => {
  if (!PUBLIC_ID_RE.test(req.params.id)) return res.status(404).json({ error: "Không tìm thấy phiếu cọc." });
  if (!req.body || Object.keys(req.body).length !== 1 || !["received", "cancelled"].includes(req.body.status)) {
    return res.status(400).json({ error: "Trạng thái phiếu không hợp lệ." });
  }
  try {
    let item = await PaymentRequest.findOneAndUpdate(
      { publicId: req.params.id, status: "pending" },
      { $set: { status: req.body.status } },
      { new: true, runValidators: true }
    );
    if (!item) {
      item = await PaymentRequest.findOne({ publicId: req.params.id });
      if (!item) return res.status(404).json({ error: "Không tìm thấy phiếu cọc." });
      if (item.status !== req.body.status) return res.status(409).json({ error: "Phiếu đã kết thúc với trạng thái khác." });
    }
    return res.json(adminJson(item));
  } catch (error) {
    console.error("Payment request status update failed:", error.message);
    return res.status(500).json({ error: "Không cập nhật được trạng thái phiếu cọc." });
  }
});

export const publicPaymentRouter = express.Router();
publicPaymentRouter.use(noStore);
publicPaymentRouter.get("/:id", async (req, res) => {
  if (!PUBLIC_ID_RE.test(req.params.id)) return res.status(404).json({ error: "Không tìm thấy phiếu cọc." });
  try {
    const item = await PaymentRequest.findOne({ publicId: req.params.id, status: { $ne: "cancelled" } });
    if (!item) return res.status(404).json({ error: "Không tìm thấy phiếu cọc." });
    return res.json(publicJson(item));
  } catch (error) {
    console.error("Public payment request lookup failed:", error.message);
    return res.status(500).json({ error: "Không tải được phiếu cọc." });
  }
});
