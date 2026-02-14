import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveSession = mutation({
  args: {
    deviceId: v.string(),
    childName: v.string(),
    childAge: v.number(),
    illnessTypes: v.array(v.string()),
    childEnergyLevel: v.string(),
    parentEnergyLevel: v.string(),
    medications: v.array(
      v.object({
        name: v.string(),
        dosage: v.string(),
        frequency: v.string(),
        timeLastGiven: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        childName: args.childName,
        childAge: args.childAge,
        illnessTypes: args.illnessTypes,
        childEnergyLevel: args.childEnergyLevel,
        parentEnergyLevel: args.parentEnergyLevel,
        medications: args.medications,
      });
      return existing._id;
    }

    return await ctx.db.insert("sessions", args);
  },
});

export const saveMedications = mutation({
  args: {
    deviceId: v.string(),
    medications: v.array(
      v.object({
        name: v.string(),
        dosage: v.string(),
        frequency: v.string(),
        timeLastGiven: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        medications: args.medications,
      });
    }
  },
});

export const ensureSickDay = mutation({
  args: {
    deviceId: v.string(),
    date: v.string(),
    onboarding: v.object({
      childName: v.string(),
      childAge: v.number(),
      illnessTypes: v.array(v.string()),
      childEnergyLevel: v.string(),
      parentEnergyLevel: v.string(),
    }),
    medications: v.array(
      v.object({
        name: v.string(),
        dosage: v.string(),
        frequency: v.string(),
        timeLastGiven: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sickDays")
      .withIndex("by_deviceId_date", (q) =>
        q.eq("deviceId", args.deviceId).eq("date", args.date)
      )
      .first();

    if (!existing) {
      await ctx.db.insert("sickDays", args);
    }
  },
});

export const savePlan = mutation({
  args: {
    deviceId: v.string(),
    date: v.string(),
    items: v.array(
      v.object({
        itemId: v.string(),
        type: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        time: v.string(),
        emoji: v.string(),
        tags: v.array(v.string()),
        status: v.string(),
        isGentle: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("planItems")
      .withIndex("by_deviceId_date", (q) =>
        q.eq("deviceId", args.deviceId).eq("date", args.date)
      )
      .collect();

    for (const item of existing) {
      await ctx.db.delete(item._id);
    }

    for (const item of args.items) {
      await ctx.db.insert("planItems", {
        deviceId: args.deviceId,
        date: args.date,
        ...item,
      });
    }
  },
});

export const updatePlanItem = mutation({
  args: {
    deviceId: v.string(),
    date: v.string(),
    itemId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("planItems")
      .withIndex("by_deviceId_date", (q) =>
        q.eq("deviceId", args.deviceId).eq("date", args.date)
      )
      .collect();

    const item = items.find((i) => i.itemId === args.itemId);
    if (item) {
      await ctx.db.patch(item._id, { status: args.status });
    }
  },
});

export const addIncident = mutation({
  args: {
    deviceId: v.string(),
    date: v.string(),
    timestamp: v.string(),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("incidents", args);
  },
});
