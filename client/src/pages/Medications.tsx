import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { medicationSchema, MEDICATION_FREQUENCIES, type MedicationData } from "@shared/schema";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChevronRight, Plus, Trash2, Pill } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Medications() {
  const [, setLocation] = useLocation();
  const [medications, setMedications] = useState<MedicationData[]>([]);
  const [isAdding, setIsAdding] = useState(true); // Start with form open if empty

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
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
          Add any medications you're managing today so we can remind you when it's time for the next dose.
        </div>

        {/* List of added medications */}
        <div className="space-y-3">
          {medications.map((med, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-border shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{med.name}</h4>
                  <p className="text-sm text-muted-foreground">{med.dosage} • Every {med.frequency}</p>
                </div>
              </div>
              <button 
                onClick={() => onRemoveMedication(index)}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Add Medication Form */}
        <AnimatePresence>
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card p-5 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5"
            >
              <h3 className="font-bold text-lg mb-4">Add Medication</h3>
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
                            <SelectTrigger>
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
                        {/* Fallback to text input if 'Other' is selected logic could be added here, keeping simple for now */}
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
                            <Input placeholder="e.g. 5ml" {...field} />
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
                              <SelectTrigger>
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
                          <Input type="time" {...field} className="block w-full" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1">Add</Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full h-12 border-dashed border-2" 
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Another Medication
            </Button>
          )}
        </AnimatePresence>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border flex gap-4 safe-bottom">
          <Button 
            variant="ghost" 
            className="flex-1 h-14 text-muted-foreground"
            onClick={onSkip}
          >
            Skip for now
          </Button>
          <Button 
            className="flex-[2] h-14 text-lg rounded-xl shadow-lg shadow-primary/25"
            onClick={onContinue}
          >
            Create Plan <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </Layout>
  );
}
