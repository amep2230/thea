import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, ILLNESS_TYPES, type OnboardingData } from "@shared/schema";
import { Layout } from "@/components/Layout";
import { ToggleCard } from "@/components/ui/toggle-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Thermometer, Zap, Battery, BatteryMedium, BatteryLow, Stethoscope, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      childName: "",
      childAge: undefined,
      illnessTypes: [],
      childEnergyLevel: "Medium",
      parentEnergyLevel: "Medium",
    },
  });

  const onSubmit = (data: OnboardingData) => {
    // Persist to local storage
    localStorage.setItem("thea_onboarding", JSON.stringify(data));
    setLocation("/medications");
  };

  const handleIllnessToggle = (illness: typeof ILLNESS_TYPES[number]) => {
    const current = form.getValues("illnessTypes");
    const updated = current.includes(illness)
      ? current.filter((i) => i !== illness)
      : [...current, illness];
    form.setValue("illnessTypes", updated, { shouldValidate: true });
  };

  return (
    <Layout hideHeader>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="pt-8 pb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground mb-2">
            Let's help your little one feel better.
          </h1>
          <p className="text-muted-foreground text-lg">
            Tell us a bit about what's going on so we can build a perfect sick day plan.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Child Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
                Who is sick today?
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="childName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Child's name" className="h-12 text-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="childAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (1-8)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          max={8} 
                          className="h-12 text-lg" 
                          placeholder="Age"
                          {...field} 
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Symptoms Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">2</span>
                What are the symptoms?
              </h3>
              
              <FormField
                control={form.control}
                name="illnessTypes"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 gap-3">
                      {ILLNESS_TYPES.map((type) => (
                        <ToggleCard
                          key={type}
                          title={type}
                          selected={form.watch("illnessTypes").includes(type)}
                          onClick={() => handleIllnessToggle(type)}
                          className="aspect-[2/1] text-left px-4"
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Energy Levels Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">3</span>
                Energy Check-in
              </h3>

              <FormField
                control={form.control}
                name="childEnergyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child's Energy</FormLabel>
                    <div className="grid grid-cols-3 gap-3">
                      {["Low", "Medium", "Okay"].map((level) => (
                        <ToggleCard
                          key={level}
                          title={level}
                          icon={
                            level === "Low" ? <BatteryLow className="w-6 h-6" /> :
                            level === "Medium" ? <BatteryMedium className="w-6 h-6" /> :
                            <Battery className="w-6 h-6" />
                          }
                          selected={field.value === level}
                          onClick={() => field.onChange(level)}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentEnergyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Energy</FormLabel>
                    <div className="grid grid-cols-3 gap-3">
                      {["Low", "Medium", "High"].map((level) => (
                        <ToggleCard
                          key={level}
                          title={level}
                          icon={<Zap className="w-6 h-6" />}
                          selected={field.value === level}
                          onClick={() => field.onChange(level)}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25"
              size="lg"
            >
              Continue to Medications <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </Form>
      </motion.div>
    </Layout>
  );
}
