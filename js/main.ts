// @ts-check

import { JSON_FILE } from "./constants.js";
import { dom } from "./dom.js";
import { getState, updateState } from "./state.js";
import { AppState, DomRefs, Level, TrainingPlanJson } from "./types.js";
import { expandCollapse, getCurrentWeekAndRenderPlan, render } from "./utils.js";

// Load data and initialize app
fetch(JSON_FILE)
    .then(response => response.json())
    .then(json => init(json));

function init(json: TrainingPlanJson): void {
    const state = getState(); // State is user input selections saved in local storage    
    render(state, json, dom);
    attachEventListeners(state, json, dom);
}

function attachEventListeners(
    state: AppState,
    json: TrainingPlanJson,
    dom: DomRefs
): void {
    dom.levelInput.addEventListener("change", function () {
        const level = this.value as Level;
        updateState("level", level);
        getCurrentWeekAndRenderPlan(state, json, dom)
    });
    
    dom.startDateInput.addEventListener("change", function() {
        updateState("startDate", this.value);
        getCurrentWeekAndRenderPlan(state, json, dom)
    })

    dom.expandCollapseButton.addEventListener("click", function() {
        expandCollapse(dom);
    });

    dom.resetButton.addEventListener("click", function() {
        getCurrentWeekAndRenderPlan(state, json, dom)
    });
}