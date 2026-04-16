// Can check console to ensure this JS script is loaded
console.log("my JS script loaded");

fetch("training-plan.json")
    .then(response => response.json())
    .then(data => {
        // Check console to ensure JSON file is loaded
        console.log(`data: ${data}`);

        // Get HTML sections and templates for the page
        var levelInput = document.getElementById("training-plan-level-input");
        const levelHTML = document.querySelector(".level-subtitle");
        const planContainer = document.getElementById("training-plan-container");
        const weekTemplate = document.getElementById("week-template");
        const dayTemplate = document.getElementById("day-template");

        // Check that plan HTML container (the main container) is found
        if (!planContainer) {
            console.error("training-plan-container not found.");
            return;
        }

        // Determine which level training plan to display
        var levelSelected = levelInput.value;

        // Render training plan for the selected level
        renderPlan(levelSelected);

        // On user input change, re-render the training plan
        levelInput.addEventListener("change", function () {
            renderPlan(this.value);
        });

        // Functions:
        // Build the HTML for the page
        function renderPlan(level) {
            // 0. First, clear the container
            planContainer.innerHTML = "";

            // Get the correct section of the JSON
            const plan = data[level];

            // 1. Populate HTML sections for the page
            levelHTML.textContent = level.toUpperCase();

            // 2. Populate HTML for the training plan container
            // Loop through JSON weeks, build the week's HTML, and add it to the plan container
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

                // Add the week node to the plan container
                planContainer.appendChild(weekNode);                
            });
        }
    });