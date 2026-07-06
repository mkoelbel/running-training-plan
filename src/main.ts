import { JSON_FILE } from "./constants";
import { dom } from "./dom";
import { getState, subscribe, updateState } from "./state";
import { DomRefs, TrainingPlanJson, isLevel } from "./types";
import { expandCollapse, getCurrentWeekAndRenderPlan, renderInputsAndPlan } from "./utils";

// Load data and initialize app
fetch(JSON_FILE)
    .then(response => response.json())
    .then(json => init(json));

/**
 * Initialize the app once the training plan JSON is loaded
 */
function init(json: TrainingPlanJson): void {
    // Register a one-time listener so every state update re-renders the plan
    subscribe(() => {
        getCurrentWeekAndRenderPlan(getState(), json, dom)
    });
    renderInputsAndPlan(getState(), json, dom);
    attachEventListeners(json, dom);
}

/**
 * Wire up app UI events to state updates and UI updates
 */
function attachEventListeners(
    json: TrainingPlanJson,
    dom: DomRefs
): void {
    // Level input
    dom.levelInput.addEventListener("change", function () {
        if (isLevel(this.value)) {
            updateState("level", this.value);
        }
    });
    
    // Start date input
    dom.startDateInput.addEventListener("change", function() {
        updateState("startDate", this.value);
    })

    // Expand / Collapse button
    dom.expandCollapseButton.addEventListener("click", function() {
        expandCollapse(dom);
    });

    // Reset button
    dom.resetButton.addEventListener("click", function() {
        getCurrentWeekAndRenderPlan(getState(), json, dom)
    });
}