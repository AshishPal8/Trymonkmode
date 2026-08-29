import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEncryptedStorage } from "@/lib/encryptedStorage";
import { CalendarEvent } from "@/lib/types";
import { calendarApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useUserStore } from "./userStore";

export interface CalendarStoreState {
  calendarEvents: CalendarEvent[];
  setCalendarEvents: (events: CalendarEvent[]) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, "id">) => void;
  deleteCalendarEvent: (id: string) => void;
}

export const useCalendarStore = create<CalendarStoreState>()(
  persist(
    (set) => ({
      calendarEvents: [],

      setCalendarEvents: (events: CalendarEvent[]) =>
        set({ calendarEvents: events }),

      addCalendarEvent: (event) => {
        const newEv: CalendarEvent = { ...event, id: `e-${Date.now()}` };
        set((state) => ({ calendarEvents: [...state.calendarEvents, newEv] }));
        useUserStore.getState().addXP(10);
        toast.success("Calendar block scheduled");

        calendarApi
          .createEvent({
            title: event.title,
            description: event.description,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            category: event.category,
          })
          .catch(() => {});
      },

      deleteCalendarEvent: (id) => {
        set((state) => ({
          calendarEvents: state.calendarEvents.filter((e) => e.id !== id),
        }));
        toast.info("Event removed");
        const numId = parseInt(id.replace(/\D/g, ""), 10);
        if (!isNaN(numId)) {
          calendarApi.deleteEvent(numId).catch(() => {});
        }
      },
    }),
    {
      name: "trymonk_calendar_store",
      storage: createEncryptedStorage(),
    },
  ),
);
