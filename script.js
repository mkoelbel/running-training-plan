import { getISOWeek } from "https://cdn.jsdelivr.net/npm/date-fns@3/+esm";

// Can check console to ensure this JS script is loaded
console.log("my JS script loaded");

fetch("training-plan.json")
    .then(response => response.json())
    .then(json => {
        // Check console to ensure JSON file is loaded
        console.log(`data: ${json}`);

        // Get HTML sections (user inputs, containers, templates, etc) for the page
        const levelInput = document.getElementById("level-input");
        const startDateInput = document.getElementById("start-date-input");
        const levelHTML = document.querySelector(".level-subtitle");
        const planContainer = document.getElementById("training-plan-container");
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

        // On changing the level input, re-render the training plan
        levelInput.addEventListener("change", function () {
            const weekNum = calculateCurrentWeekNum(startDateInput.value);
            renderPlan(this.value, weekNum);
        });

        // On changing the start date input, re-calculate the current week number and re-render the training plan
        startDateInput.addEventListener("change", function() {
            const weekNum = calculateCurrentWeekNum(this.value);
            renderPlan(levelInput.value, weekNum);
        })

        // Functions:
        // Build the HTML for the training plan
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

            const workoutDetailsFormatted = json.workoutDetails
                .split("\n")
                .map(p => `<p>${p.trim()}</p>`)
                .join("");

            // Populate HTML sections
            dayNameHTML.textContent = json.day;
            workoutTypeHTML.textContent = json.workoutType;

            if (hasDistance) distanceHTML.textContent = ` (${json.distance} miles)`;

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
        function calculateCurrentWeekNum(startDate) {
            const startWeekNum = getISOWeek(new Date(startDate));
            const currentWeekNum = getISOWeek(new Date());
            const weekNumToDisplay = currentWeekNum - startWeekNum + 1; // Use 1-based indexing
            return weekNumToDisplay;
        }
    });