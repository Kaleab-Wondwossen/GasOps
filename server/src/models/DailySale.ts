import { Schema, model } from "mongoose";

const PaymentsSchema = new Schema(
    {
        cash: { type: String, default: "0" }, telebirr: { type: String, default: "0" },
        transfer: { type: String, default: "0" }, cheque: { type: String, default: "0" }, coupon: { type: String, default: "0" }
    },
    { _id: false }
);

const TierSchema = new Schema({ price: String, litres: String }, { _id: false });

const DailySaleSchema = new Schema({
    stationId: { type: String, index: true, required: true },
    date: { type: String, index: true, required: true }, // YYYY-MM-DD
    fuel: { type: String, enum: ["benzene", "gasoil"], index: true, required: true },
    status: { type: String, enum: ["draft", "closed"], default: "draft", index: true },

    // inputs
    pricingMode: { type: String, enum: ["benzene-single", "gasoil-tiers"], required: true },
    meterAM: String, meterPM: String, rolloverMax: String,
    baseTariff: String,
    benzeneExtraPerLitre: String,
    gasoilTiers: { type: [TierSchema], default: [] },

    creditsGiven: String, creditPayments: String, expenses: String,
    payments: { type: PaymentsSchema, default: {} },
    totalPayments: String,

    // computed snapshot
    litersSold: String,
    baseSales: String,
    extraRevenue: String,
    adjustments: String,
    netBase: String,
    expected: String,
    profitOrDelta: String,
    additionalLitres: String,
    totalRevenue: String,
    warnings: { type: [String], default: [] },

    closedAt: Date,
    closedBy: String,
    reopenHistory: [{
        reopenedAt: Date,
        reopenedBy: String,
        reason: String
    }],
    // optional: integrity snapshot for stock
    litersDeducted: String,

    createdBy: String,
    createdAt: { type: Date, default: Date.now },
    updatedBy: String,
    updatedAt: { type: Date, default: Date.now }
});

DailySaleSchema.index({ stationId: 1, date: 1, fuel: 1 }, { unique: true });

export const DailySaleModel = model("DailySale", DailySaleSchema);


