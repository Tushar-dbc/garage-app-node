import { Schema, model } from "mongoose";

// Address Schema
const addressSchema = new Schema({
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    zipcode: { type: Number, required: true },
    address1: { type: String, required: true },
    address2: { type: String, required: true },
});

// Service Schema
const serviceSchema = new Schema({
    title: { type: String, required: true },
    serialNo: { type: String, required: true },
    hsnSac: { type: String, required: true },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
    gst: { type: Number, required: true },
});

// Invoice Schema
const invoiceSchema = new Schema(
    {
        invoiceID: { type: Number, required: true },
        customerName: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        invoiceDate: { type: Date, default: null },
        address: { type: addressSchema, required: true },
        vehicleCompany: { type: String, required: true },
        vehicleVariant: { type: String, required: true },
        vehicleNo: { type: String, required: true },
        kilometers: { type: Number, required: true },
        nextkilometer: { type: Number, required: true },
        services: { type: [serviceSchema], required: true },
        status: {
            type: String,
            enum: ["active", "delete"],
            default: "active",
        },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

// Create the Invoice Model
const Invoice = model("Invoice", invoiceSchema);

export default Invoice;
