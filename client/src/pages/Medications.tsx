import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { medicationSchema, MEDICATION_FREQUENCIES, type MedicationData } from "@shared/schema";
import { Layout } from "@/components/Layout";
import { TheaCard } from "@/components/ui/theaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Medications() {
  const [, setLocation] = useLocation();
  const [medications, setMedications] = useState<MedicationData[]>([]);
  const [isAdding, setIsAdding] = useState(true);

  const form = useForm<MedicationData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "4h",
      timeLastGiven: new Date().toTimeString().slice(0, 5),
    },
  });

  const onAddMedication = (data: MedicationData) => {
    setMedications([...medications, data]);
    form.reset({
      name: "",
      dosage: "",
      frequency: "4h",
      timeLastGiven: new Date().toTimeString().slice(0, 5),
    });
    setIsAdding(false);
  };

  const onRemoveMedication = (index: number) => {
    const newMeds = [...medications];
    newMeds.splice(index, 1);
    setMedications(newMeds);
  };

  const onContinue = () => {
    localStorage.setItem("thea_medications", JSON.stringify(medications));
    setLocation("/plan");
  };

  const onSkip = () => {
    localStorage.setItem("thea_medications", JSON.stringify([]));
    setLocation("/plan");
  };

  return (
    <Layout title="Medications" showBack backTo="/onboarding">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <TheaCard
          type="alert"
          title="Medication Reminders"
          description="Add any medications you're managing today so we can remind you when it's time for the next dose."
          data-testid="card-medication-info"
        />

        <div className="space-y-3">
          {medications.map((med, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <TheaCard
                type="medication"
                title={med.name}
                description={`${med.dosage} \u00b7 Every ${med.frequency}`}
                data-testid={`card-medication-${index}`}
                actions={
                  <Button
                    data-testid={`button-remove-medication-${index}`}
                    size="icon"
                    variant="ghost"
                    onClick={() => onRemoveMedication(index)}
                    className="text-muted-foreground"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                }
              />
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card p-5 rounded-xl border border-thea-border shadow-thea"
            >
              <h3 className="font-display text-lg mb-4">Add Medication</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onAddMedication)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medication Name</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-medication-name">
                              <SelectValue placeholder="Select or type..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Children's Tylenol">Children's Tylenol</SelectItem>
                            <SelectItem value="Children's Motrin">Children's Motrin</SelectItem>
                            <SelectItem value="Amoxicillin">Amoxicillin</SelectItem>
                            <SelectItem value="Ibuprofen">Ibuprofen</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dosage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage</FormLabel>
                          <FormControl>
                            <Input data-testid="input-dosage" placeholder="e.g. 5ml" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-frequency">
                                <SelectValue placeholder="Frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MEDICATION_FREQUENCIES.map(freq => (
                                <SelectItem key={freq} value={freq}>Every {freq}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="timeLastGiven"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Last Given</FormLabel>
                        <FormControl>
                          <Input data-testid="input-time-last-given" type="time" {...field} className="block w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button data-testid="button-cancel-medication" type="button" variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                    <Button data-testid="button-add-medication" type="submit" className="flex-1">Add</Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          ) : (
            <Button 
              data-testid="button-add-another"
              variant="outline" 
              className="w-full border-dashed border-2" 
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Another Medication
            </Button>
          )}
        </AnimatePresence>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FAF6F1]/80 backdrop-blur-lg border-t border-thea-border flex gap-4 safe-bottom">
          <Button 
            data-testid="button-skip-medications"
            variant="ghost" 
            className="flex-1"
            size="lg"
            onClick={onSkip}
          >
            Skip for now
          </Button>
          <Button 
            data-testid="button-create-plan"
            className="flex-[2]"
            size="lg"
            onClick={onContinue}
          >
            Create Plan <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </Layout>
  );
}
