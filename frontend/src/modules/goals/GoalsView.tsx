"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import {
  Plus,
  Target,
  CheckCircle2,
  Calendar,
  Trash2,
  Edit2,
  Sparkles,
} from "lucide-react";
import { GoalItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ModuleContainer } from "@/components/layout/ModuleContainer";
import { CustomSelect } from "@/components/ui/select";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export function GoalsView() {
  const { goals, addGoal, updateGoal, toggleGoalMilestone, deleteGoal } =
    useApp();

  const [timeframeFilter, setTimeframeFilter] = useState<
    "all" | "yearly" | "monthly" | "weekly"
  >("all");
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);

  // Goal Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalItem["category"]>("Career");
  const [timeframe, setTimeframe] = useState<GoalItem["timeframe"]>("yearly");
  const [targetMetric, setTargetMetric] = useState("");
  const [deadline, setDeadline] = useState("2026-12-31");
  const [color, setColor] = useState("#0052FF");
  const [milestonesInput, setMilestonesInput] = useState("");

  const filteredGoals = goals.filter((g) => {
    if (timeframeFilter !== "all" && g.timeframe !== timeframeFilter)
      return false;
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingGoal(null);
    setTitle("");
    setCategory("Career");
    setTimeframe("yearly");
    setTargetMetric("");
    setDeadline("2026-12-31");
    setColor("#0052FF");
    setMilestonesInput("");
    setShowModal(true);
  };

  const handleOpenEditModal = (goal: GoalItem) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setCategory(goal.category);
    setTimeframe(goal.timeframe);
    setTargetMetric(goal.targetMetric || "");
    setDeadline(goal.deadline);
    setColor(goal.color || "#0052FF");
    setMilestonesInput(goal.milestones.map((m) => m.title).join("\n"));
    setShowModal(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const lines = milestonesInput
      .split("\n")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    if (editingGoal) {
      // Preserve existing milestone completion states if title matches
      const updatedMilestones = lines.map((lineText, idx) => {
        const existing = editingGoal.milestones.find(
          (m) => m.title.toLowerCase() === lineText.toLowerCase(),
        );
        return {
          id: existing ? existing.id : `gm-${Date.now()}-${idx}`,
          title: lineText,
          completed: existing ? existing.completed : false,
          progress: existing ? existing.progress : 0,
        };
      });

      const compCount = updatedMilestones.filter((m) => m.completed).length;
      const progress =
        updatedMilestones.length > 0
          ? Math.round((compCount / updatedMilestones.length) * 100)
          : 0;

      updateGoal(editingGoal.id, {
        title: title.trim(),
        category,
        timeframe,
        deadline,
        progress,
        color,
        targetMetric: targetMetric.trim() || undefined,
        milestones: updatedMilestones,
      });
    } else {
      const newMilestones = lines.map((lineText, idx) => ({
        id: `gm-${Date.now()}-${idx}`,
        title: lineText,
        completed: false,
        progress: 0,
      }));

      addGoal({
        title: title.trim(),
        category,
        timeframe,
        deadline,
        progress: 0,
        color,
        targetMetric: targetMetric.trim() || undefined,
        milestones: newMilestones,
      });
    }

    setShowModal(false);
  };

  return (
    <ModuleContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Goals & Strategic Objectives
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Deconstruct high-level visions into actionable milestones and
            measurable daily progress
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl px-4 py-2 shadow-sm transition transform active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Goal</span>
        </Button>
      </div>

      {/* Timeframe Filter Bar */}
      <div className="flex items-center gap-1.5 p-1.5 ios-card rounded-2xl w-fit">
        {(["all", "yearly", "monthly", "weekly"] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframeFilter(tf)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
              timeframeFilter === tf
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Goal Cards Grid */}
      {filteredGoals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl ios-card border border-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto shadow-sm">
            <Target className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              No Strategic Goals Yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Set high-leverage milestones (e.g. Master System Design, Run
              Marathon, Launch SaaS) to measure progress.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl px-4 py-2 shadow-sm cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Set Your First Goal</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className="ios-card rounded-3xl p-5 sm:p-6 space-y-4 relative flex flex-col justify-between border border-border"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                    {goal.category} • {goal.timeframe}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(goal)}
                      className="p-1.5 text-muted-foreground hover:text-primary rounded-lg transition cursor-pointer"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg transition cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-card-foreground">
                    {goal.title}
                  </h3>
                  {goal.targetMetric && (
                    <p className="text-xs text-primary flex items-center gap-1 mt-1 font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Target: {goal.targetMetric}</span>
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono text-card-foreground">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${goal.progress}%`,
                        backgroundColor: goal.color || "var(--primary)",
                      }}
                    />
                  </div>
                </div>

                {/* Milestones List */}
                {goal.milestones.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">
                      Milestones (
                      {goal.milestones.filter((m) => m.completed).length}/
                      {goal.milestones.length})
                    </span>
                    <div className="space-y-1.5">
                      {goal.milestones.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => toggleGoalMilestone(goal.id, m.id)}
                          className={`p-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition ${
                            m.completed
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium"
                              : "bg-muted text-card-foreground hover:bg-muted/80"
                          }`}
                        >
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 ${
                              m.completed
                                ? "text-emerald-500 fill-emerald-500"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span
                            className={
                              m.completed ? "line-through opacity-80" : ""
                            }
                          >
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border text-[11px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Target: {goal.deadline}</span>
                </span>
                <span
                  className={
                    goal.progress >= 70
                      ? "text-emerald-500 font-bold"
                      : "text-primary"
                  }
                >
                  {goal.progress >= 100
                    ? "Achieved 🏆"
                    : goal.progress >= 50
                      ? "In Progress"
                      : "On Track"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingGoal ? "Edit Strategic Goal" : "Set Strategic Goal"}
        description={
          editingGoal
            ? "Refine your long-term milestones and outcome targets."
            : "Define high-leverage milestones, quarterly targets, and success metrics."
        }
        icon={<Target className="w-4 h-4" />}
        topAccentColor="#0052FF"
        maxWidth="md"
      >
        <form onSubmit={handleSaveGoal} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Goal Title *
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Master System Design & Distributed Caching"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Category
              </label>
              <CustomSelect
                value={category}
                onChange={(val) => setCategory(val as GoalItem["category"])}
                options={[
                  { value: "Career", label: "Career & Tech" },
                  { value: "Learning", label: "Learning" },
                  { value: "Fitness", label: "Fitness" },
                  { value: "Finance", label: "Finance" },
                  { value: "Personal", label: "Personal" },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Timeframe
              </label>
              <CustomSelect
                value={timeframe}
                onChange={(val) => setTimeframe(val as GoalItem["timeframe"])}
                options={[
                  { value: "yearly", label: "Yearly Vision" },
                  { value: "monthly", label: "Monthly Target" },
                  { value: "weekly", label: "Weekly Milestone" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Target Metric (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g. 10 Case Studies"
                value={targetMetric}
                onChange={(e) => setTargetMetric(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Target Deadline
              </label>
              <CustomDatePicker value={deadline} onChange={setDeadline} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Key Milestones (One per line)
            </label>
            <textarea
              rows={3}
              placeholder="Design Redis Cluster&#10;Implement Raft Consensus&#10;Benchmark 100k RPS"
              value={milestonesInput}
              onChange={(e) => setMilestonesInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 dark:bg-muted/30 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground resize-none leading-relaxed transition"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl px-5 py-2 shadow-sm cursor-pointer"
            >
              {editingGoal ? "Update Goal" : "Establish Goal"}
            </Button>
          </div>
        </form>
      </Modal>
    </ModuleContainer>
  );
}
