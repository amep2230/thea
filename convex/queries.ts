import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSession = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
      .first();
  },
});

export const getCurrentPlan = query({
  args: { deviceId: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("planItems")
      .withIndex("by_deviceId_date", (q) =>
        q.eq("deviceId", args.deviceId).eq("date", args.date)
      )
      .collect();

    return items.sort((a, b) => a.time.localeCompare(b.time));
  },
});

export const getSickDays = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const days = await ctx.db
      .query("sickDays")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
      .collect();

    const result = [];
    for (const day of days) {
      const planItems = await ctx.db
        .query("planItems")
        .withIndex("by_deviceId_date", (q) =>
          q.eq("deviceId", day.deviceId).eq("date", day.date)
        )
        .collect();

      const incidents = await ctx.db
        .query("incidents")
        .withIndex("by_deviceId_date", (q) =>
          q.eq("deviceId", day.deviceId).eq("date", day.date)
        )
        .collect();

      result.push({
        ...day,
        plan: planItems.sort((a, b) => a.time.localeCompare(b.time)),
        incidents: incidents.sort((a, b) =>
          a.timestamp.localeCompare(b.timestamp)
        ),
      });
    }

    return result.sort((a, b) => b.date.localeCompare(a.date));
  },
});
