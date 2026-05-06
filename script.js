import { getISOWeek } from "https://cdn.jsdelivr.net/npm/date-fns@3/+esm";

console.log("my JS script loaded"); // Ensure this JS script is loaded

// Constants
const dom = {
    levelInput: $(document, "#level-input"),
    startDateInput: $(document, "#start-date-input"),
    expandCollapseButton: $(document, "#expand-collapse-button"),
    resetButton: $(document, "#reset-button"),
    level: $(document, ".level-subtitle"),
    planContainer: $(document, "#training-plan-container"),
    weekTemplate: $(document, "#week-template"),
    dayTemplate: $(document, "#day-template")
}

// Read from JSON file
fetch("training-plan.json")
    .then(response => response.json())
    .then(json => init(json));

// Functions
/**
 * Initialize the page
 * 
 * @param {string} json JSON content
 */
function init(json) {
    console.log(`JSON length: ${Object.keys(json).length}`); // Ensure JSON file is loaded

    // Checks
    if (!dom.planContainer) {
        console.error("training-plan-container not found.");
        return;
    }

    // Populate input defaults
    dom.levelInput.value = json.levelDefault;
    dom.startDateInput.value = json.startDateDefault;

    // Render training plan for the selected level
    getCurrentWeekAndRenderPlan(dom.startDateInput.value, dom.levelInput.value, json);

    // Event listeners
    dom.levelInput.addEventListener("change", function () {
        getCurrentWeekAndRenderPlan(dom.startDateInput.value, this.value, json);
    });

    dom.startDateInput.addEventListener("change", function() {
        getCurrentWeekAndRenderPlan(this.value, dom.levelInput.value, json);
    })

    dom.expandCollapseButton.addEventListener("click", function() {
        expandCollapse();
    });

    dom.resetButton.addEventListener("click", function() {
        getCurrentWeekAndRenderPlan(dom.startDateInput.value, dom.levelInput.value, json);
    });
}

/**
 * Calculate the current week given a starting date, and render the training plan for the given level, 
 * with the current week expanded
 * 
 * @param {string} startDate Date when training started (for calculating the current week number)
 * @param {string} level Training plan level (beginner, intermediate, advanced)
 */
function getCurrentWeekAndRenderPlan(startDate, level, json) {
    const weekNum = calculateCurrentWeekNum(startDate);
    renderPlan(level, weekNum, json);
}

/**
 * Build the HTML for the training plan for the given level, with the given week expanded
 * 
 * @param {string} level Training plan level (beginner, intermediate, advanced)
 * @param {number} weekNumToExpand Week number to expand
 */
function renderPlan(level, weekNumToExpand, json) {
    // Clear the container
    dom.planContainer.innerHTML = "";

    // Get the JSON section for the given level
    const planJson = json[level];
    if (!planJson) {
        console.error("Plan not found for level:", level);
        return;
    }

    // Populate some HTML sections for the page
    dom.level.textContent = level.toUpperCase();

    // Populate HTML for the training plan container
    let i = 1; // Keep track of weeks we're building so we know which week to expand
    planJson.forEach(weekJson => {
        // Build the week HTML node
        const weekNode = renderWeek(weekJson)
        // If it's the week to expand, do that
        if (i == weekNumToExpand) {
            weekNode.querySelector("details").open = true;
        }
        // Add the week node to the plan container
        dom.planContainer.appendChild(weekNode);
        i++;
    });
}

/**
 * Build the HTML for a week
 * 
 * @param {string} json JSON for the given week
 * @returns HTML node for the week
 */
function renderWeek(json) {
    // Create HTML node
    const node = dom.weekTemplate.content.cloneNode(true);

    // DOM sections
    const week = {
        number: $(node, ".week-number"),
        headnote: $(node, ".headnote"),
        footnote: $(node, ".footnote"),
        daysContainer: $(node, ".days"),
    }

    // Variables
    const hasFootnote = json.footnote && json.footnote.trim() !== "";

    // Render HTML
    week.number.textContent = json.week;
    week.headnote.textContent = json.headnote;
    if (hasFootnote) {
        week.footnote.textContent = json.footnote;
    } else {
        week.footnote.classList.add("d-none");
    }

    // Populate HTML for the days container
    json.days.forEach(dayJson => {
        // Build the day HTML node
        const dayNode = renderDay(dayJson);
        // Add it to the days container
        week.daysContainer.appendChild(dayNode);
    });
    
    // Return populated node
    return node;
}

/**
 * Build the HTML for a day, given JSON data and an HTML template
 * 
 * @param {string} json JSON for the given day
 * @returns HTML node for the day
 */
function renderDay(json) {
    // Create HTML node
    const node = dom.dayTemplate.content.cloneNode(true);

    // DOM sections
    const day = {
        name: $(node, ".day-name"),
        workoutType: $(node, ".workout-type"),
        distance: $(node, ".distance"),
        workoutOverviewAndDetails: $(node, ".workout-overview-and-details"),
        workoutOverview: $(node, ".workout-overview"),
        workoutDetails: $(node, ".workout-details"),
        tip: $(node, ".tip")
    }
    day.tipText = $(day.tip, ".tip-text");

    // Variables
    const hasDistance = json.distance && parseFloat(json.distance) > 0;
    const hasWorkoutOverviewOrDetails = (json.workoutOverview && json.workoutOverview.trim() !== "") || (json.workoutDetails && json.workoutDetails.trim() !== "");
    const hasTip = json.tip && json.tip.trim() !== "";

    const distanceOrTimeUnit = (dom.levelInput.value == "beginner") ? "minutes" : "miles";
    const workoutDetailsFormatted = json.workoutDetails
        .split("\n")
        .map(p => `<p>${p.trim()}</p>`)
        .join("");

    // Render HTML
    day.name.textContent = json.day;
    day.workoutType.textContent = json.workoutType;

    if (hasDistance) day.distance.textContent = ` (${json.distance} ${distanceOrTimeUnit})`;

    if (hasWorkoutOverviewOrDetails) {
        day.workoutOverview.textContent = json.workoutOverview;
        day.workoutDetails.innerHTML = workoutDetailsFormatted;
    } else {
        day.workoutOverviewAndDetails.classList.add("d-none");
    }

    if (hasTip) {
        day.tipText.textContent = json.tip;
    } else {
        day.tip.classList.add("d-none");
    }

    // Return populated node
    return node;
}

/**
 * Given a start date, calculate the current week number (week differential using 1-based indexing)
 * (e.g. if today is in the same week as the start date, return 1. If it's the
 * week after the week of the start date, return 2.)
 * 
 * @param {string} startDate Date when training started
 * @returns Number of weeks into the training plan that we currently are
 */
function calculateCurrentWeekNum(startDate) {
    const startWeekNum = getISOWeek(new Date(startDate));
    const currentWeekNum = getISOWeek(new Date());
    const weekNumToDisplay = currentWeekNum - startWeekNum + 1; // Use 1-based indexing
    return weekNumToDisplay;
}

/**
 * Expand or collapse all weeks, depending on whether any weeks are currently expanded.
 * If any week is currently expanded, collapse all. Otherwise, expand all.
 * (Prefer collapsing all rather than expanding all, since collapsing all is cleaner.)
 */
function expandCollapse() {
    const weekNodes = $$(dom.planContainer, "details");
    const anyWeekIsExpanded = Array.from(weekNodes).some(w => w.open);
    if (anyWeekIsExpanded) {
        weekNodes.forEach(w => {
            w.open = false;
        });
        dom.expandCollapseButton.textContent = "Expand All";
    } else {
        weekNodes.forEach(w => {
            w.open = true;
        });
        dom.expandCollapseButton.textContent = "Collapse All";
    }
}

/**
 * Get the first DOM element matching a CSS selector. 
 * Logs a warning if no element is found.
 * 
 * @param {string} selector CSS selector
 * @returns {HTMLElement|null} The matching DOM element, or null if not found
 */
// function $(selector) {
//     const element = document.querySelector(selector);
//     if (!element) console.warn(`Missing element: ${selector}`);
//     return element;
// }

// /**
//  * Get all DOM elements matching a CSS selector.
//  * Logs a warning if no elements are found.
//  *
//  * @param {string} selector CSS selector
//  * @returns {NodeListOf<HTMLElement>} NodeList of matching elements (may be empty)
//  */
// function $$(selector) {
//     const elements = document.querySelectorAll(selector);
//     if (!elements) console.warn(`Missing element: ${selector}`);
//     return elements;
// }

/**
 * Get the first DOM element matching a CSS selector for the given DOM section. 
 * Logs a warning if no element is found.
 * 
 * @param {string} section DOM section
 * @param {string} selector CSS selector
 * @returns {HTMLElement|null} The matching DOM element, or null if not found
 */
function $(section, selector) {
    const element = section.querySelector(selector);
    if (!element) console.warn(`Missing element: ${selector}`);
    return element;
}

/**
 * Get all DOM elements matching a CSS selector for the given DOM section.
 * Logs a warning if no elements are found.
 *
 * @param {string} section DOM section
 * @param {string} selector CSS selector
 * @returns {NodeListOf<HTMLElement>} NodeList of matching elements (may be empty)
 */
function $$(section, selector) {
    const elements = section.querySelectorAll(selector);
    if (!elements) console.warn(`Missing element: ${selector}`);
    return elements;
}