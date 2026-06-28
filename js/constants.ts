import type { AppState } from "./types";

export const STORAGE_KEY = "trainingPlanState";

export const DEFAULT_STATE: AppState = {
    startDate: "2026-04-15",
    level: "advanced",
}

export const JSON_FILE = "training-plan.json";