import mongoose from "mongoose";

const bankSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  bankBin: { type: String, required: true },
  accountName: { type: String, required: true },
  accountNumber: { type: String, required: true },
}, { _id: false });

const paymentRequestSchema = new mongoose.Schema({
  publicId: { type: String, required: true, unique: true, index: true, immutable: true },
  code: { type: String, required: true, unique: true, index: true, immutable: true },
  customerName: { type: String, required: true, maxlength: 200 },
  orderId: { type: String, default: null },
  transferContent: { type: String, required: true, maxlength: 500 },
  amountVnd: { type: Number, required: true, min: 1, max: 999999999999 },
  bank: { type: bankSchema, required: true },
  status: { type: String, enum: ["pending", "received", "cancelled"], default: "pending", index: true },
  createdBy: { type: String, required: true, default: "admin" },
  idempotencyKey: { type: String, required: true, unique: true, index: true, immutable: true },
  payloadHash: { type: String, required: true, immutable: true, select: false },
}, { timestamps: true, collection: "paymentRequests" });

export default mongoose.model("PaymentRequest", paymentRequestSchema);
