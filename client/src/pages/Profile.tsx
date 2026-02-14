import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getDeviceId } from "@/lib/device-id";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Activity, Zap, Heart, Pill, FileText, Clock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function SickDayCard({ day, index }: { day: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(day.date + "T12:00:00");
  const formatted = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const completedCount = day.plan.filter((p: any) => p.status === "completed").length;
  const totalCount = day.plan.length;

  return (
    <Card data-testid={`card-sick-day-${index}`}>
      <CardContent className="p-4">
        <button
          data-testid={`button-expand-day-${index}`}
          className="w-full flex items-center justify-between gap-2"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-medium text-foreground">{formatted}</p>
              <p className="text-xs text-muted-foreground">
                {day.onboarding.illnessTypes.join(", ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {day.incidents.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {day.incidents.length} incident{day.incidents.length > 1 ? "s" : ""}
              </Badge>
            )}
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Child energy:</span>
                <span className="text-xs font-medium">{day.onboarding.childEnergyLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Parent energy:</span>
                <span className="text-xs font-medium">{day.onboarding.parentEnergyLevel}</span>
              </div>
            </div>

            {day.medications.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Pill className="w-3 h-3" /> Medications
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {day.medications.map((med: any, i: number) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      {med.name} — {med.dosage} every {med.frequency}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {day.plan.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> Schedule ({completedCount}/{totalCount} completed)
                </p>
                <div className="space-y-1.5">
                  {day.plan.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground w-10 shrink-0">{item.time}</span>
                      <span className={`flex-1 min-w-0 truncate ${item.status === "completed" ? "line-through text-muted-foreground" : item.status === "skipped" ? "line-through text-muted-foreground/50" : "text-foreground"}`}>
                        {item.title}
                      </span>
                      <Badge variant="secondary" className="text-[9px] shrink-0">{item.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {day.incidents.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" /> Incident Reports
                </p>
                <div className="space-y-2">
                  {day.incidents.map((inc: any, i: number) => {
                    const time = new Date(inc.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                    return (
                      <div key={i} className="bg-muted/50 rounded-md p-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-muted-foreground">{time}</span>
                          {inc.category && <Badge variant="secondary" className="text-[9px]">{inc.category}</Badge>}
                        </div>
                        {inc.description && <p className="text-xs text-foreground">{inc.description}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Profile() {
  const deviceId = getDeviceId();
  const session = useQuery(api.queries.getSession, { deviceId });
  const sickDays = useQuery(api.queries.getSickDays, { deviceId });

  if (session === undefined || sickDays === undefined) {
    return (
      <Layout title="Profile" showBack backTo="/plan">
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout title="Profile" showBack backTo="/plan">
        <div className="text-center py-20 text-muted-foreground">
          <p>No profile data yet. Complete onboarding first.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile" showBack backTo="/plan">
      <div className="space-y-6">
        <Card data-testid="card-child-info">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              Child Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <span data-testid="text-child-name" className="text-sm font-medium">{session.childName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Age</span>
              <span data-testid="text-child-age" className="text-sm font-medium">{session.childAge} year{session.childAge !== 1 ? "s" : ""} old</span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Current illness</span>
              <div className="flex flex-wrap gap-1">
                {session.illnessTypes.map((illness: string) => (
                  <Badge key={illness} variant="secondary" data-testid={`badge-illness-${illness.toLowerCase().replace(/\s/g, '-')}`}>
                    {illness}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-base font-display text-foreground mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Sick Day History
          </h2>
          {!sickDays || sickDays.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p data-testid="text-no-history" className="text-sm text-muted-foreground">
                  No sick day records yet. Your daily sessions will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sickDays.map((day: any, i: number) => (
                <SickDayCard key={day.date} day={day} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
