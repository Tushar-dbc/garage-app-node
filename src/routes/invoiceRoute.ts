// src/routes/userRoutes.ts
import express from "express";
import User from "../models/User";
import { authenticateToken } from "../middleware/authMiddleware";
import Invoice from "../models/Invoice";

const router = express.Router();

router.post("/add", async (req, res) => {
    try {
        const {
            id,
            customerName,
            mobileNumber,
            invoiceDate,
            address,
            vehicleCompany,
            vehicleVariant,
            vehicleNo,
            kilometers,
            nextkilometer,
            services,
            createdBy,
            updatedBy,
        } = req.body;

        if (id) {
            // Update existing invoice
            const updatedInvoice = await Invoice.findByIdAndUpdate(
                id,
                {
                    customerName,
                    mobileNumber,
                    invoiceDate,
                    address,
                    vehicleCompany,
                    vehicleVariant,
                    vehicleNo,
                    kilometers,
                    nextkilometer,
                    services,
                    updatedBy,
                    updatedAt: new Date(), // Optional: to track last update time
                },
                { new: true } // Return the updated document
            );

            if (!updatedInvoice) {
                return res.status(404).json({ error: "Invoice not found" });
            }
            return res.status(200).json(updatedInvoice);
        } else {
            // Add new invoice
            const invoices = await Invoice.find(); // Fetch all invoices
            const newInvoiceData = req.body;

            const newInvoice = new Invoice({
                invoiceID: invoices.length + 1, // Generate a new invoice ID
                customerName: newInvoiceData.customerName || "",
                mobileNumber: newInvoiceData.mobileNumber || "",
                invoiceDate: newInvoiceData.invoiceDate || null,
                address: newInvoiceData.address || {},
                vehicleCompany: newInvoiceData.vehicleCompany || "",
                vehicleVariant: newInvoiceData.vehicleVariant || "",
                vehicleNo: newInvoiceData.vehicleNo || "",
                kilometers: newInvoiceData.kilometers || 0,
                nextkilometer: newInvoiceData.nextkilometer || 0,
                services: newInvoiceData.services || [],
                createdBy: newInvoiceData.createdBy,
                updatedBy: newInvoiceData.updatedBy,
            });

            await newInvoice.save();
            return res.status(201).json(newInvoice); // Return the newly created invoice
        }
    } catch (error) {
        console.error("Error in add/update invoice:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/", authenticateToken, async (req, res) => {
    try {
        const userEmail = (req as any).user.email;
        const user = await User.findOne({ email: userEmail });
        const { sort, sortDirection, searchText, recordPerPage, page } =
            req.body;
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        let match: any = { $and: [{ status: { $ne: "delete" } }] };

        if (user.role !== "SA") {
            match["$and"].push({ createdBy: user._id });
        }

        if (searchText) {
            match = {
                ...match,
                $or: [
                    {
                        customerName: {
                            $regex: searchText,
                            $options: "i",
                        },
                    },
                ],
            };
        }

        const items = await Invoice.aggregate([
            {
                $match: match,
            },
            {
                $sort: { [sort]: sortDirection },
            },
            {
                $skip: (page - 1) * recordPerPage,
            },

            {
                $limit: recordPerPage,
            },
        ]);

        const count = await Invoice.aggregate([
            {
                $match: match,
            },
        ]);

        return res.status(200).json({
            items,
            count: count.length,
        });
    } catch (error) {
        console.error("Error getting invoices:", error);
        res.status(500).send(error);
    }
});

router.post("/getInvoice/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const invoice = await Invoice.findById(id);

        if (!invoice) {
            return res.status(404).send({ message: "Invoice not found" });
        }

        res.status(200).json(invoice);
    } catch (error) {
        console.error("Error fetching invoice by ID:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

router.post("/get-count", authenticateToken, async (req, res) => {
    try {
        const userEmail = (req as any).user.email;
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        let match: any = { $and: [{ status: { $ne: "delete" } }] };

        if (user.role !== "SA") {
            match["$and"].push({ createdBy: user._id });
        }
        const count = await Invoice.countDocuments(match);

        res.status(200).json(count);
    } catch (error) {
        console.error("Error getting invoices:", error);
        res.status(500).send(error);
    }
});

router.put("/deleteinvoice/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await Invoice.findByIdAndUpdate(
            id,
            { status: "delete" },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).send({ error: "User not found" });
        }

        res.status(200).send(invoice);
    } catch (error) {
        console.error("Error in deleting user:", error);
        res.status(400).send(error);
    }
});

export default router;
