import { getISOWeek } from "date-fns";
import { $, $$ } from "./dom.js";
import { AppState, DayJson, DomRefs, Level, TrainingPlanJson, WeekJson } from "./types.js";

//#region Renderers
export function renderInputsAndPlan(
    state: AppState,
    json: TrainingPlanJson,
    dom: DomRefs
): void {
    renderInputs(state, dom);
    getCurrentWeekAndRenderPlan(state, json, dom);
}

function renderInputs(
    state: AppState,
    dom: DomRefs
): void {
    dom.levelInput.value = state.level;
    dom.startDateInput.value = state.startDate;
}

export function getCurrentWeekAndRenderPlan(
    state: AppState,
    json: TrainingPlanJson,
    dom: DomRefs
): void {
    const weekNum = calculateCurrentWeekNum(state.startDate);
    renderPlan(state.level, weekNum, json, dom);
}

function renderPlan(
    level: Level, 
    weekNumToExpand: number, 
    json: TrainingPlanJson, 
    dom: DomRefs
): void {
    // Clear the container
    dom.planContainer.innerHTML = "";

    // Get JSON section for the given level
    const planJson = json[level];
    if (!planJson) {
        console.error("Plan not found for level:", level);
        return;
    }

    // Render HTML elements
    renderHtmlElement(dom.level, level.toUpperCase());

    // Render HTML for training plan container
    let i = 1; // Keep track of weeks we're building so we know which week to expand
    planJson.forEach(weekJson => {
        // Build HTML node
        const weekNode = renderWeek(weekJson, dom)
        // If it's the week to expand, do that
        if (i == weekNumToExpand) {
            const details = weekNode.querySelector("details");
            if (details) {
                details.open = true;
            }
        }
        // Add node to container
        dom.planContainer.appendChild(weekNode);
        i++;
    });
}

function renderWeek(
    json: WeekJson, 
    dom: DomRefs
): DocumentFragment {
    // Create HTML node
    const node = dom.weekTemplate.content.cloneNode(true) as DocumentFragment;

    // DOM sections
    const week = {
        number: $(node, ".week-number"),
        headnote: $(node, ".headnote"),
        footnote: $(node, ".footnote"),
        daysContainer: $(node, ".days"),
    }

    // Render HTML elements
    renderHtmlElement(week.number, json.week.toString());
    renderHtmlElement(week.headnote, json.headnote);
    renderHtmlElement(week.footnote, json.footnote);

    // Render HTML for days container
    json.days.forEach(dayJson => {
        // Build HTML node
        const dayNode = renderDay(dayJson, dom);
        // Add node to container
        week.daysContainer.appendChild(dayNode);
    });
    
    // Return populated node
    return node;
}

function renderDay(
    json: DayJson, 
    dom: DomRefs
): DocumentFragment {
    // Create HTML node
    const node = dom.dayTemplate.content.cloneNode(true) as DocumentFragment;

    // DOM sections
    let day = {
        name: $(node, ".day-name"),
        workoutType: $(node, ".workout-type"),
        distance: $(node, ".distance"),
        workoutOverviewAndDetails: $(node, ".workout-overview-and-details"),
        workoutOverview: $(node, ".workout-overview"),
        workoutDetails: $(node, ".workout-details"),
        tip: $(node, ".tip"),
        tipText: null as HTMLElement | null,
    }
    day.tipText = $(day.tip, ".tip-text");

    // Constants
    const hasDistance = json.distance && parseFloat(json.distance) > 0;
    const distanceOrTimeUnit = (dom.levelInput.value == "beginner") ? "minutes" : "miles";
    const workoutOverviewAndDetailsAreEmpty = textIsEmpty(json.workoutOverview) && textIsEmpty(json.workoutDetails);

    // Render HTML elements
    renderHtmlElement(day.name, json.day);
    renderHtmlElement(day.workoutType, json.workoutType);
    if (hasDistance) {
        renderHtmlElement(day.distance, ` (${json.distance} ${distanceOrTimeUnit})`);
    }
    if (workoutOverviewAndDetailsAreEmpty) {
        setVisibility(day.workoutOverviewAndDetails, false);
    } else {
        renderHtmlElement(day.workoutOverview, json.workoutOverview);
        renderHtmlElement(day.workoutDetails, json.workoutDetails);
    }
    // Need to call functions separately here, since we have 2 different HTML elements for tip
    toggleIfEmpty(day.tip, json.tip);
    setFormattedText(day.tipText, json.tip);

    // Return populated node
    return node;
}

function renderHtmlElement(
    element: HTMLElement, 
    text: string
): void {
    toggleIfEmpty(element, text);
    setFormattedText(element, text);
}
//#endregion 

//#region Set Visibility
export function expandCollapse(dom: DomRefs): void {
    const weekNodes = $$(dom.planContainer, "details") as NodeListOf<HTMLDetailsElement>;
    const anyWeekIsExpanded = Array.from(weekNodes).some(w => w.open);
    if (anyWeekIsExpanded) {
        expandNodes(weekNodes, false);
        dom.expandCollapseButton.textContent = "Expand All";
    } else {
        expandNodes(weekNodes, true);
        dom.expandCollapseButton.textContent = "Collapse All";
    }
}

function expandNodes(
    nodes: NodeListOf<HTMLDetailsElement>, 
    setToVisible: boolean = true
): void {
    nodes.forEach(w => {
        w.open = setToVisible;
    });
}

function toggleIfEmpty(
    element: HTMLElement, 
    text: string
): void {
    if (textIsEmpty(text)) {
        setVisibility(element, false);
    } else {
        setVisibility(element, true);
    }
}

function setVisibility(
    element: HTMLElement, 
    setToVisible = true
): void {
    if (setToVisible) {
        element.classList.remove("d-none");
    } else {
        element.classList.add("d-none");
    }
}
//#endregion

//#region Formatters
function setFormattedText(
    element: HTMLElement, 
    text: string
): void {
    const [formattedText, didFormatText] = formatText(text);
    const property = didFormatText ? "innerHTML" : "textContent";
    element[property] = formattedText;
}

function formatText(text: string): [string, boolean] {
    // Insert line breaks
    if (text && text.includes("\n")) {
        const formattedText = text
            .split("\n")
            .map(p => p.trim())
            .filter(Boolean)
            .map(p => `<div>${p}</div>`)
            .join("");
        return [formattedText, true];
    }
    // If we make it to this point, that means text doesn't need to be formatted, so just return text
    return [text, false];
}
//#endregion

//#region Utilities
function calculateCurrentWeekNum(startDate: string): number {
    const startWeekNum = getISOWeek(new Date(startDate));
    const currentWeekNum = getISOWeek(new Date());
    const weekNumToDisplay = currentWeekNum - startWeekNum + 1; // Use 1-based indexing
    return weekNumToDisplay;
}

function textIsEmpty(text: string): boolean {
    const result = !text || text.trim() == "";
    return result;
}
//#endregion