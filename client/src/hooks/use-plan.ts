import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type GeneratePlanInput, type UpdatePlanItemInput, type PlanResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Since we are using hardcoded logic on the backend (or mocking it for now),
// we don't have a persistent GET endpoint for the plan in this simple version.
// The plan is generated via POST and returned. 
// In a real app with a DB, we would have a useQuery hook here to fetch the active plan.

export function useGeneratePlan() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: GeneratePlanInput) => {
      // Ensure time is set if not provided
      const payload = {
        ...data,
        currentTime: data.currentTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      };
      
      const res = await fetch(api.plan.generate.path, {
        method: api.plan.generate.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to generate plan');
      }
      
      return api.plan.generate.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Error generating plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePlanItem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string } & UpdatePlanItemInput) => {
      const url = buildUrl(api.plan.updateItem.path, { id });
      const res = await fetch(url, {
        method: api.plan.updateItem.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error('Failed to update item');
      }
      
      return api.plan.updateItem.responses[200].parse(await res.json());
    },
    onSuccess: (updatedItem) => {
      // Since we don't have a persistent GET query for the plan in this MVP,
      // we need to update the local state in the component where the plan lives.
      // However, if we had a proper query key, we would invalidate it here:
      // queryClient.invalidateQueries({ queryKey: [api.plan.get.path] });
      
      toast({
        title: status === 'completed' ? "Great job!" : "Skipped",
        description: status === 'completed' ? "Keep up the good work." : "No worries, we'll adjust.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
