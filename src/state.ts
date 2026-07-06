import { DEFAULT_STATE, STORAGE_KEY } from "./constants";
import { AppState } from "./types";

let state: AppState = loadState();
let listeners: Array<() => void> = [];

/**
 * Load persisted state from local storage, using defaults for any missing values.
 * 
 * Load persisted state from local storage and merge it with defaults
 * 
 * @returns A state object
 */
function loadState(): AppState {
    const rawState = localStorage.getItem(STORAGE_KEY);
    const jsonState = rawState ? JSON.parse(rawState) : {};
    const stateToReturn = { ...DEFAULT_STATE, ...jsonState };
    return stateToReturn;
}

/**
 * Save state to local storage
 */
function saveState(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Return a snapshot of the current state
 */
export function getState(): AppState {
    return {...state};
}

/**
 * Update the current state for the given key-value pair and persist it. Then run listener functions.
 */
export function updateState<K extends keyof AppState>(
    key: K,
    value: AppState[K]
): void {
    state = {...state, [key]: value};
    saveState();
    notifyListeners();
}

/**
 * Register a listener function to run whenever state changes
 * 
 * @param listener - A callback function
 */
export function subscribe(listener: () => void): void {
    listeners.push(listener);
}

/**
 * Run all listener functions
 */
function notifyListeners(): void {
    listeners.forEach(listener => listener());
}