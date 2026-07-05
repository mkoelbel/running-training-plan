/**
 * Constrained string indicating the training plan level
 */
export type Level = "beginner" | "intermediate" | "advanced"

/**
 * Checks whether a value is one of the supported Level strings
 * 
 * @returns True if the provided value is a valid Level, otherwise false
 */
export function isLevel(value: string): value is Level {
    const isLevel: boolean = value === "beginner"
        || value === "intermediate"
        || value === "advanced";
    return isLevel;
}

/**
 * The persisted app state for the training plan UI
 */
export type AppState = {
    startDate: string;
    level: Level;
}

/**
 * The structure of a single day in the training plan JSON
 */
export type DayJson = {
    day: string;
    workoutType: string;
    distance: string;
    workoutOverview: string;
    workoutDetails: string;
    tip: string;
}

/**
 * The structure of a single week in the training plan JSON
 */
export type WeekJson = {
    week: number;
    headnote: string;
    footnote: string;
    days: DayJson[];
}

/**
 * The structure of the full training plan JSON, grouped by level
 */
export type TrainingPlanJson = {
    beginner: WeekJson[];
    intermediate: WeekJson[];
    advanced: WeekJson[];
}

/**
 * DOM elements used by the app
 */
export type DomRefs = {
    levelInput: HTMLSelectElement;
    startDateInput: HTMLInputElement;
    expandCollapseButton: HTMLButtonElement;
    resetButton: HTMLButtonElement;
    level: HTMLElement;
    planContainer: HTMLElement;
    weekTemplate: HTMLTemplateElement;
    dayTemplate: HTMLTemplateElement;
}