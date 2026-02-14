import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
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
  }).index("by_deviceId", ["deviceId"]),

  sickDays: defineTable({
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
  }).index("by_deviceId", ["deviceId"]).index("by_deviceId_date", ["deviceId", "date"]),

  planItems: defineTable({
    deviceId: v.string(),
    date: v.string(),
    itemId: v.string(),
    type: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    time: v.string(),
    emoji: v.string(),
    tags: v.array(v.string()),
    status: v.string(),
    isGentle: v.boolean(),
  }).index("by_deviceId_date", ["deviceId", "date"]),

  incidents: defineTable({
    deviceId: v.string(),
    date: v.string(),
    timestamp: v.string(),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
  }).index("by_deviceId_date", ["deviceId", "date"]),
});
