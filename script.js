import { getISOWeek } from "https://cdn.jsdelivr.net/npm/date-fns@3/+esm";

// Can check console to ensure this JS script is loaded
console.log("my JS script loaded");

fetch("training-plan.json")
    .then(response => response.json())
    .then(data => {
        // Check console to ensure JSON file is loaded
        console.log(`data: ${data}`);

        // Get user input defaults from JSON
        const levelDefault = data.levelDefault;
        const startDateDefault = data.startDateDefault;

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
        levelInput.value = levelDefault;
        startDateInput.value = startDateDefault;

        // Render training plan for the selected level and week
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
        // Build the HTML for the page
        function renderPlan(level, weekNumToExpand) {
            // 0. First, clear the container
            planContainer.innerHTML = "";

            // Get the correct section of the JSON
            const plan = data[level];
            if (!plan) {
                console.error("Plan not found for level:", level);
                return;
            }

            // 1. Populate some HTML sections for the page
            levelHTML.textContent = level.toUpperCase();

            // 2. Populate HTML for the training plan container
            // Loop through JSON weeks, build the week's HTML, and add it to the plan container
            let i = 1; // Keep track of weeks we're building so we know which week to expand
            plan.forEach(week => {
                // Create a node for the current week
                const weekNode = weekTemplate.content.cloneNode(true);

                // Get HTML sections for the week template
                const weekNumberHTML = weekNode.querySelector(".week-number");
                const headnoteHTML = weekNode.querySelector(".headnote");
                const footnoteHTML = weekNode.querySelector(".footnote");
                const daysContainer = weekNode.querySelector(".days");

                // Populate HTML sections
                weekNumberHTML.textContent = week.week;
                headnoteHTML.textContent = week.headnote;
                footnoteHTML.textContent = week.footnote;

                // Populate HTML for the days container
                // Loop through JSON days, build the day's HTML, and add it to the days container
                week.days.forEach(day => {
                    // Create a node for the current day
                    const dayNode = dayTemplate.content.cloneNode(true);

                    // Get HTML sections for the day template
                    const dayNameHTML = dayNode.querySelector(".day-name");
                    const workoutTypeHTML = dayNode.querySelector(".workout-type");
                    const distanceHTML = dayNode.querySelector(".distance");
                    const workoutOverviewHTML = dayNode.querySelector(".workout-overview");
                    const workoutDetailsHTML = dayNode.querySelector(".workout-details");
                    const tipHTML = dayNode.querySelector(".tip");
                    const tipTextHTML = tipHTML.querySelector(".tip-text");

                    // Get some variables
                    const hasDistance = day.distance && parseFloat(day.distance) > 0;
                    const hasTip = day.tip && day.tip.trim() !== "";
                    const hasWorkoutDetails = day.workoutDetails && day.workoutDetails.trim() !== "";
                    const workoutDetailsFormatted = day.workoutDetails
                        .split("\n")
                        .map(p => `<p>${p.trim()}</p>`)
                        .join("");

                    // Populate HTML sections
                    dayNameHTML.textContent = day.day;
                    workoutTypeHTML.textContent = day.workoutType;
                    if (hasDistance) distanceHTML.textContent = ` (${day.distance} miles)`;
                    workoutOverviewHTML.textContent = day.workoutOverview;
                    if (hasWorkoutDetails) workoutDetailsHTML.innerHTML = workoutDetailsFormatted;
                    if (hasTip) {
                        tipTextHTML.textContent = day.tip;
                    } else {
                        tipHTML.classList.add("d-none");
                    }

                    // Add the day node to the days container
                    daysContainer.appendChild(dayNode);
                });

                // If it's the week to expand, do that
                if (i == weekNumToExpand) {
                    weekNode.querySelector("details").open = true;
                }

                // Add the week node to the plan container
                planContainer.appendChild(weekNode);

                i++;
            });
        }

        function calculateCurrentWeekNum(startDate) {
            const startWeekNum = getISOWeek(new Date(startDate));
            const currentWeekNum = getISOWeek(new Date());
            const weekNumToDisplay = currentWeekNum - startWeekNum + 1; // Use 1-based indexing
            return weekNumToDisplay;
        }
    });