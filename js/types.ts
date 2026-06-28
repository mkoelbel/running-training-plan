export type Level = "beginner" | "intermediate" | "advanced"

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
    tipText: string;
}

export type WeekJson = {
    week: string;
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