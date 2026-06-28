export type Level = "beginner" | "intermediate" | "advanced"

export function isLevel(value: string): value is Level {
    const isLevel: boolean = value === "beginner"
        || value === "intermediate"
        || value === "advanced";
    return isLevel;
}

export type AppState = {
    startDate: string;
    level: Level;
}

export type DayJson = {
    day: string;
    workoutType: string;
    distance: string;
    workoutOverview: string;
    workoutDetails: string;
    tip: string;
}

export type WeekJson = {
    week: number;
    headnote: string;
    footnote: string;
    days: DayJson[];
}

export type TrainingPlanJson = {
    beginner: WeekJson[];
    intermediate: WeekJson[];
    advanced: WeekJson[];
}

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