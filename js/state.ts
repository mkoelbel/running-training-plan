import { DEFAULT_STATE, STORAGE_KEY } from "./constants.js";
import { AppState } from "./types.js";

let state: AppState = loadState();
let listeners: Array<() => void> = [];

function loadState(): AppState {
    const rawState = localStorage.getItem(STORAGE_KEY);
    const jsonState = rawState ? JSON.parse(rawState) : {};
    const result = { ...DEFAULT_STATE, ...jsonState };
    return result;
}

function saveState(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getState(): AppState {
    return {...state};
}

export function updateState<K extends keyof AppState>(
    key: K,
    value: AppState[K]
): void {
    state = {...state, [key]: value};
    saveState();
    notifyListeners();
}

function notifyListeners(): void {
    listeners.forEach(listener => listener());
}

export function subscribe(listener: () => void): void {
    listeners.push(listener);
}