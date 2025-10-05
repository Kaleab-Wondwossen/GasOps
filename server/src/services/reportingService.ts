import { DailySaleModel } from "../models/DailySale";
import { Types } from "mongoose";

type Range = { from: string; to: string }; // YYYY-MM-DD inclusive range (we’ll treat to inclusive)

function toDate(d: string) {
  // normalize as UTC midnight for consistency
  return new Date(d + "T00:00:00.000Z");
}

export async function summaryByDate(stationId:string, range: Range) {
  // Treat 'to' inclusive: add 1 day for $lt
  const toPlus1 = new Date(new Date(toDate(range.to)).getTime() + 24*3600*1000);

  const pipeline = [
    { $match: {
        stationId,
        date: { $gte: range.from, $lt: range.to + "\uffff" } // safe string compare (YYYY-MM-DD)
      }
    },
    { $project: {
        date: 1, fuel:1, status:1,
        litersSold: { $toDecimal: "$litersSold" },
        baseSales: { $toDecimal: "$baseSales" },
        extraRevenue: { $toDecimal: { $ifNull: ["$extraRevenue", "0"] } },
        totalRevenue: { $toDecimal: "$totalRevenue" },
        profitOrDelta: { $toDecimal: { $ifNull: ["$profitOrDelta", "0"] } }
      }
    },
    { $group: {
        _id: { date:"$date", fuel:"$fuel" },
        litersSold: { $sum: "$litersSold" },
        baseSales: { $sum: "$baseSales" },
        extraRevenue: { $sum: "$extraRevenue" },
        totalRevenue: { $sum: "$totalRevenue" },
        profitOrDelta: { $sum: "$profitOrDelta" }
      }
    },
    { $sort: { "_id.date": 1 as 1, "_id.fuel": 1 as 1 } }
  ];

  const rows = await DailySaleModel.aggregate(pipeline);
  return rows.map((r:any) => ({
    date: r._id.date,
    fuel: r._id.fuel,
    litersSold: r.litersSold.toString(),
    baseSales: r.baseSales.toString(),
    extraRevenue: r.extraRevenue.toString(),
    totalRevenue: r.totalRevenue.toString(),
    profitOrDelta: r.profitOrDelta.toString()
  }));
}

export async function overviewTotals(stationId:string, range: Range) {
  const data = await summaryByDate(stationId, range);
  const agg = (key: keyof typeof data[number]) =>
    data.reduce((s:any, x:any) => s + Number(x[key]), 0);

  const totals = {
    litersSold: agg("litersSold"),
    baseSales: agg("baseSales"),
    extraRevenue: agg("extraRevenue"),
    totalRevenue: agg("totalRevenue"),
    profitOrDelta: agg("profitOrDelta")
  };

  // by fuel buckets
  const fuelTotals: any = {};
  for (const row of data) {
    fuelTotals[row.fuel] = fuelTotals[row.fuel] || { litersSold:0, totalRevenue:0 };
    fuelTotals[row.fuel].litersSold += Number(row.litersSold);
    fuelTotals[row.fuel].totalRevenue += Number(row.totalRevenue);
  }

  return { totals, fuelTotals, rows: data };
}

export async function dashboardToday(stationId:string, dateISO: string) {
  // quick snapshot for dashboard: today's sales (both fuels)
  const rows = await DailySaleModel.find({ stationId, date: dateISO }).lean();
  // Load stock to show low flag
  const { StockModel } = await import("../models/Stock");
  const stock = await StockModel.find({ stationId }).lean();

  return {
    sales: rows.map(r => ({
      fuel: r.fuel,
      status: r.status,
      litersSold: r.litersSold,
      totalRevenue: r.totalRevenue,
      warnings: r.warnings || []
    })),
    stock: stock.map((s:any) => ({
      fuel: s.fuel,
      currentLitres: s.currentLitres,
      capacityLitres: s.capacityLitres,
      lowThresholdPct: s.lowThresholdPct,
      low: (Number(s.currentLitres)/Number(s.capacityLitres)) < (s.lowThresholdPct/100)
    }))
  };
}
