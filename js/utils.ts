import { getISOWeek } from "date-fns";
import { $, $$ } from "./dom.js";
import { AppState, DayJson, DomRefs, Level, TrainingPlanJson, WeekJson } from "./types.js";

//#region Renderers
/**
 * Update inputs from state and render the training plan
 */
export function renderInputsAndPlan(
    state: AppState,
    json: TrainingPlanJson,
    dom: DomRefs
): void {
    renderInputs(state, dom);
    getCurrentWeekAndRenderPlan(state, json, dom);
}

/**
 * Update inputs from state values
 */
function renderInputs(
    state: AppState,
    dom: DomRefs
): void {
    dom.levelInput.value = state.level;
    dom.startDateInput.value = state.startDate;
}

/**
 * Determine the current week number and render the training plan
 */
export function getCurrentWeekAndRenderPlan(
    state: AppState,
    json: TrainingPlanJson,
    dom: DomRefs
): void {
    const weekNum = calculateCurrentWeekNum(state.startDate);
    renderPlan(state.level, weekNum, json, dom);
}

/**
 * Render the training plan for the given level, and expand the week for the given week number
 */
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

/**
 * Build a week HTML section - clone the week HTML template, populate it with values from the provided JSON,
 * and build and add the day sections
 * 
 * @param json - JSON section for a single week
 * @param dom 
 * @returns The completed week HTML
 */
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

/**
 * Build a day HTML section - clone the day HTML template and populate it with values from the provided JSON
 * 
 * @param json - JSON section for a single day
 * @param dom 
 * @returns The complete day HTML
 */
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

/**
 * Populate an HTML element with text, apply formatting if the text includes HTML formatting tags,
 * and hide the element if the text is empty
 */
function renderHtmlElement(
    element: HTMLElement, 
    text: string
): void {
    toggleIfEmpty(element, text);
    setFormattedText(element, text);
}
//#endregion 

//#region Set Visibility
/**
 * If any week in the training plan is currently expanded, collapse all week nodes and set the 
 * Expand / Collapse button to say "Expand". Otherwise, do the opposite.
 * (Prefer collapsing all over expanding all to keep things neat and tidy)
 */
export function expandCollapse(dom: DomRefs): void {
    const weekNodes = $$(dom.planContainer, "details") as NodeListOf<HTMLDetailsElement>;
    const anyWeekIsExpanded = Array.from(weekNodes).some(w => w.open);
    var buttonActionText;
    if (anyWeekIsExpanded) {
        setNodesVisibility(weekNodes, false);
        buttonActionText = "Expand";
    } else {
        setNodesVisibility(weekNodes, true);
        buttonActionText = "Collapse";
    }
    dom.expandCollapseButton.textContent = `${buttonActionText} All`;
}

/**
 * Close or open all HTML nodes in the provided list based on the provided boolean flag
 */
function setNodesVisibility(
    nodes: NodeListOf<HTMLDetailsElement>, 
    setToVisible: boolean = true
): void {
    nodes.forEach(w => {
        w.open = setToVisible;
    });
}

/**
 * If the provided text is empty, hide the provided HTML element. Otherwise, show the element.
 */
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

/**
 * Show or hide an HTML element based on the provided boolean flag
 */
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
/**
 * Populate an HTML element with text. If text includes HTML formatting tags, apply the formatting.
 */
function setFormattedText(
    element: HTMLElement, 
    text: string
): void {
    const [formattedText, didFormatText] = formatText(text);
    const property = didFormatText ? "innerHTML" : "textContent";
    element[property] = formattedText;
}

/**
 * Convert plain text into HTML-formatted text when the it contains supported formatting syntax.
 * Otherwise return the plain text.
 * Supported formatting syntax: line breaks
 * 
 * @returns A tuple of (formattedText, didFormat)
 */
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
/**
 * Calculate the current training plan week number based on a start date.
 * For example, if it's currently the same week as the start date, we are in week 1.
 * If it's 2 weeks after the start date, we are in week 3.
 * 
 * @param startDate - Date on which training started
 * @returns The training plan week we are currently in
 */
function calculateCurrentWeekNum(startDate: string): number {
    const startWeekNum = getISOWeek(new Date(startDate));
    const currentWeekNum = getISOWeek(new Date());
    const weekNumToDisplay = currentWeekNum - startWeekNum + 1; // Use 1-based indexing
    return weekNumToDisplay;
}

/**
 * True if the provided text is empty, otherwise false
 */
function textIsEmpty(text: string): boolean {
    const result = !text || text.trim() == "";
    return result;
}
//#endregion