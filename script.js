import { getISOWeek } from "https://cdn.jsdelivr.net/npm/date-fns@3/+esm";

// Can check console to ensure this JS script is loaded
console.log("my JS script loaded");

fetch("training-plan.json")
    .then(response => response.json())
    .then(json => {
        // Check console to ensure JSON file is loaded
        console.log(`data: ${json}`);

        // Get HTML sections for the page
        // User inputs
        const levelInput = document.getElementById("level-input");
        const startDateInput = document.getElementById("start-date-input");
        // Buttons
        const expandCollapseButton = document.getElementById("expand-collapse-button");
        const resetButton = document.getElementById("reset-button");
        // Titles
        const levelHTML = document.querySelector(".level-subtitle");
        // Containers
        const planContainer = document.getElementById("training-plan-container");
        // Templates
        const weekTemplate = document.getElementById("week-template");
        const dayTemplate = document.getElementById("day-template");

        // Check that plan HTML container (the main container) is found
        if (!planContainer) {
            console.error("training-plan-container not found.");
            return;
        }

        // Populate user inputs with defaults from JSON
        levelInput.value = json.levelDefault;
        startDateInput.value = json.startDateDefault;

        // Render training plan for the selected level
        const weekNum = calculateCurrentWeekNum(startDateInput.value);
        renderPlan(levelInput.value, weekNum);

        // ---------- Event listeners ----------
        levelInput.addEventListener("change", function () {
            getCurrentWeekAndRenderPlan(startDateInput.value, this.value);
        });

        startDateInput.addEventListener("change", function() {
            getCurrentWeekAndRenderPlan(this.value, levelInput.value);
        })

        expandCollapseButton.addEventListener("click", function() {
            expandCollapse();
        });

        resetButton.addEventListener("click", function() {
            getCurrentWeekAndRenderPlan(startDateInput.value, levelInput.value);
        });

        // ---------- Functions ----------
        // Calculate the current week given a starting date, and render the training plan for the given level, with the current week expanded
        // Inputs: 
        //   - Date when training started (for calculating the current week number) 
        //   - Training plan level (beginner, intermediate, advanced)
        // Output: HTML for the training plan container
        function getCurrentWeekAndRenderPlan(startDate, level) {
            const weekNum = calculateCurrentWeekNum(startDate);
            renderPlan(level, weekNum);
        }

        // Build the HTML for the training plan for the given level, with the given week expanded
        // Inputs: 
        //   - Training plan level (beginner, intermediate, advanced)
        //   - Week number to expand
        // Output: HTML for the training plan container
        function renderPlan(level, weekNumToExpand) {
            // Clear the container
            planContainer.innerHTML = "";

            // Get the JSON section for the given level
            const planJson = json[level];
            if (!planJson) {
                console.error("Plan not found for level:", level);
                return;
            }

            // Populate some HTML sections for the page
            levelHTML.textContent = level.toUpperCase();

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
                planContainer.appendChild(weekNode);
                i++;
            });
        }

        // Build the HTML for a week
        // Inputs: JSON for the given week
        // Output: HTML node for the week
        function renderWeek(json) {
            // Create an HTML node for the current week
            const node = weekTemplate.content.cloneNode(true);

            // Get sections for the HTML template
            const weekNumberHTML = node.querySelector(".week-number");
            const headnoteHTML = node.querySelector(".headnote");
            const footnoteHTML = node.querySelector(".footnote");
            const daysContainer = node.querySelector(".days");

            // Populate HTML sections
            weekNumberHTML.textContent = json.week;
            headnoteHTML.textContent = json.headnote;
            footnoteHTML.textContent = json.footnote;

            // Populate HTML for the days container
            json.days.forEach(dayJson => {
                // Build the day HTML node
                const dayNode = renderDay(dayJson);
                // Add it to the days container
                daysContainer.appendChild(dayNode);
            });
            
            // Return populated node
            return node;
        }

        // Build the HTML for a day, given JSON data and an HTML template
        // Inputs: JSON for the given day
        // Output: HTML node for the day
        function renderDay(json) {
            // Create an HTML node for the current day
            const node = dayTemplate.content.cloneNode(true);

            // Get sections for the HTML template
            const dayNameHTML = node.querySelector(".day-name");
            const workoutTypeHTML = node.querySelector(".workout-type");
            const distanceHTML = node.querySelector(".distance");
            const workoutOverviewAndDetailsHTML = node.querySelector(".workout-overview-and-details");
            const workoutOverviewHTML = node.querySelector(".workout-overview");
            const workoutDetailsHTML = node.querySelector(".workout-details");
            const tipHTML = node.querySelector(".tip");
            const tipTextHTML = tipHTML.querySelector(".tip-text");

            // Get some variables
            const hasDistance = json.distance && parseFloat(json.distance) > 0;
            const hasWorkoutOverviewOrDetails = (json.workoutOverview && json.workoutOverview.trim() !== "") || (json.workoutDetails && json.workoutDetails.trim() !== "");
            const hasTip = json.tip && json.tip.trim() !== "";

            const distanceOrTimeUnit = (levelInput.value == "beginner") ? "minutes" : "miles";
            const workoutDetailsFormatted = json.workoutDetails
                .split("\n")
                .map(p => `<p>${p.trim()}</p>`)
                .join("");

            // Populate HTML sections
            dayNameHTML.textContent = json.day;
            workoutTypeHTML.textContent = json.workoutType;

            if (hasDistance) distanceHTML.textContent = ` (${json.distance} ${distanceOrTimeUnit})`;

            if (hasWorkoutOverviewOrDetails) {
                workoutOverviewHTML.textContent = json.workoutOverview;
                workoutDetailsHTML.innerHTML = workoutDetailsFormatted;
            } else {
                workoutOverviewAndDetailsHTML.classList.add("d-none");
            }

            if (hasTip) {
                tipTextHTML.textContent = json.tip;
            } else {
                tipHTML.classList.add("d-none");
            }

            // Return populated node
            return node;
        }

        // Given a start date, calculate the current week number (week differential using 1-based indexing)
        // (e.g. if today is in the same week as the start date, return 1. If it's the
        // week after the week of the start date, return 2.)
        // Inputs: Date when training started
        // Output: Number of weeks into the training plan that we currently are
        function calculateCurrentWeekNum(startDate) {
            const startWeekNum = getISOWeek(new Date(startDate));
            const currentWeekNum = getISOWeek(new Date());
            const weekNumToDisplay = currentWeekNum - startWeekNum + 1; // Use 1-based indexing
            return weekNumToDisplay;
        }

        // Expand or collapse all weeks, depending on whether any weeks are currently expanded.
        // If any week is currently expanded, collapse all. Otherwise, expand all.
        // (Prefer collapsing all rather than expanding all, since collapsing all is cleaner.)
        // Inputs: N/A
        // Output: N/A
        function expandCollapse() {
            const weekNodes = planContainer.querySelectorAll("details");
            const anyWeekIsExpanded = Array.from(weekNodes).some(w => w.open);
            if (anyWeekIsExpanded) {
                weekNodes.forEach(w => {
                    w.open = false;
                });
                expandCollapseButton.textContent = "Expand All";
            } else {
                weekNodes.forEach(w => {
                    w.open = true;
                });
                expandCollapseButton.textContent = "Collapse All";
            }
        }
    });