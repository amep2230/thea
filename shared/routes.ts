import { z } from 'zod';
import { 
  onboardingSchema, 
  medicationSchema, 
  planItemSchema,
  type GeneratePlanRequest 
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  plan: {
    generate: {
      method: 'POST' as const,
      path: '/api/plan/generate' as const,
      input: z.object({
        onboarding: onboardingSchema,
        medications: z.array(medicationSchema).optional(),
        currentTime: z.string(),
        incident: z.enum(["Fever spike", "Threw up", "Energy crashed", "Feeling better", "Won't eat/drink"]).optional(),
        incidentDescription: z.string().optional(),
        existingPlan: z.array(planItemSchema).optional(),
      }).refine(
        (data) => !data.incidentDescription || data.incidentDescription.trim().length > 0,
        { message: "Incident description cannot be empty whitespace", path: ["incidentDescription"] }
      ),
      responses: {
        200: z.array(planItemSchema),
        400: errorSchemas.validation,
      },
    },
    updateItem: {
      method: 'PATCH' as const,
      path: '/api/plan/:id' as const,
      input: z.object({
        status: z.enum(["completed", "skipped"]),
      }),
      responses: {
        200: planItemSchema,
        404: errorSchemas.notFound,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type GeneratePlanInput = z.infer<typeof api.plan.generate.input>;
export type PlanResponse = z.infer<typeof api.plan.generate.responses[200]>;
export type UpdatePlanItemInput = z.infer<typeof api.plan.updateItem.input>;
