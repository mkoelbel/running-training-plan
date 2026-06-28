import type { DomRefs } from "./types";

export const dom: DomRefs = {
    levelInput: $(document, "#level-input"),
    startDateInput: $(document, "#start-date-input"),
    expandCollapseButton: $(document, "#expand-collapse-button"),
    resetButton: $(document, "#reset-button"),
    level: $(document, ".level-subtitle"),
    planContainer: $(document, "#training-plan-container"),
    weekTemplate: $(document, "#week-template"),
    dayTemplate: $(document, "#day-template")
}

/**
 * Get the first DOM element matching a CSS selector for the given DOM section. 
 * Throws an error if no element is found.
 */
export function $<T extends Element = HTMLElement>(
    section: ParentNode,
    selector: string
): T {
    const element = section.querySelector<T>(selector);
    if (!element) {
        throw new Error (`Missing element: ${selector}`);   
    }
    return element;
}

/**
 * Get all DOM elements matching a CSS selector for the given DOM section.
 * Throws an error if no elements are found.
 */
export function $$<T extends Element = HTMLElement>(
    section: ParentNode,
    selector: string
): NodeListOf<T> {
    const elements = section.querySelectorAll<T>(selector);
    if (elements.length === 0) {
        throw new Error (`Missing element: ${selector}`);   
    }
    return elements;
}