import { JSON_FILE } from "./constants.js";
import { dom } from "./dom.js";
import { getState, subscribe, updateState } from "./state.js";
import { DomRefs, TrainingPlanJson, isLevel } from "./types.js";
import { expandCollapse, getCurrentWeekAndRenderPlan, renderInputsAndPlan } from "./utils.js";

// Load data and initialize app
fetch(JSON_FILE)
    .then(response => response.json())
    .then(json => init(json));

function init(json: TrainingPlanJson): void {
    // Register a one-time listener so every state update re-renders the plan
    subscribe(() => {
        const latestState = getState();
        getCurrentWeekAndRenderPlan(latestState, json, dom)
    });
    const state = getState();
    renderInputsAndPlan(state, json, dom);
    attachEventListeners(json, dom);
}

function attachEventListeners(
    json: TrainingPlanJson,
    dom: DomRefs
): void {
    dom.levelInput.addEventListener("change", function () {
        if(isLevel(this.value)) {
            updateState("level", this.value);
        }
    });
    
    dom.startDateInput.addEventListener("change", function() {
        updateState("startDate", this.value);
    })

    dom.expandCollapseButton.addEventListener("click", function() {
        expandCollapse(dom);
    });

    dom.resetButton.addEventListener("click", function() {
        const state = getState();
        getCurrentWeekAndRenderPlan(state, json, dom)
    });
}