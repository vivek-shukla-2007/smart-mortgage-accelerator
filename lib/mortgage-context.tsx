import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MortgageScenario } from "./mortgage-calculator";

/**
 * Mortgage Context - Manages app state and scenarios
 */

export interface MortgageState {
  scenarios: MortgageScenario[];
  currentScenarioId: string | null;
  currency: string;
  decimalPlaces: number;
  theme: "light" | "dark";
}

export type MortgageAction =
  | { type: "ADD_SCENARIO"; payload: MortgageScenario }
  | { type: "UPDATE_SCENARIO"; payload: MortgageScenario }
  | { type: "DELETE_SCENARIO"; payload: string }
  | { type: "SET_CURRENT_SCENARIO"; payload: string | null }
  | { type: "SET_CURRENCY"; payload: string }
  | { type: "SET_DECIMAL_PLACES"; payload: number }
  | { type: "SET_THEME"; payload: "light" | "dark" }
  | { type: "LOAD_STATE"; payload: MortgageState };

const initialState: MortgageState = {
  scenarios: [],
  currentScenarioId: null,
  currency: "USD",
  decimalPlaces: 2,
  theme: "light",
};

function mortgageReducer(state: MortgageState, action: MortgageAction): MortgageState {
  switch (action.type) {
    case "ADD_SCENARIO":
      return {
        ...state,
        scenarios: [...state.scenarios, action.payload],
        currentScenarioId: action.payload.id,
      };

    case "UPDATE_SCENARIO":
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };

    case "DELETE_SCENARIO":
      const remaining = state.scenarios.filter((s) => s.id !== action.payload);
      return {
        ...state,
        scenarios: remaining,
        currentScenarioId:
          state.currentScenarioId === action.payload
            ? remaining[0]?.id || null
            : state.currentScenarioId,
      };

    case "SET_CURRENT_SCENARIO":
      return {
        ...state,
        currentScenarioId: action.payload,
      };

    case "SET_CURRENCY":
      return {
        ...state,
        currency: action.payload,
      };

    case "SET_DECIMAL_PLACES":
      return {
        ...state,
        decimalPlaces: action.payload,
      };

    case "SET_THEME":
      return {
        ...state,
        theme: action.payload,
      };

    case "LOAD_STATE":
      return action.payload;

    default:
      return state;
  }
}

interface MortgageContextType {
  state: MortgageState;
  addScenario: (scenario: MortgageScenario) => void;
  updateScenario: (scenario: MortgageScenario) => void;
  deleteScenario: (id: string) => void;
  setCurrentScenario: (id: string | null) => void;
  setCurrency: (currency: string) => void;
  setDecimalPlaces: (places: number) => void;
  setTheme: (theme: "light" | "dark") => void;
  getCurrentScenario: () => MortgageScenario | undefined;
  saveState: () => Promise<void>;
  loadState: () => Promise<void>;
}

const MortgageContext = createContext<MortgageContextType | undefined>(undefined);

export function MortgageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mortgageReducer, initialState);

  const addScenario = useCallback((scenario: MortgageScenario) => {
    dispatch({ type: "ADD_SCENARIO", payload: scenario });
  }, []);

  const updateScenario = useCallback((scenario: MortgageScenario) => {
    dispatch({ type: "UPDATE_SCENARIO", payload: scenario });
  }, []);

  const deleteScenario = useCallback((id: string) => {
    dispatch({ type: "DELETE_SCENARIO", payload: id });
  }, []);

  const setCurrentScenario = useCallback((id: string | null) => {
    dispatch({ type: "SET_CURRENT_SCENARIO", payload: id });
  }, []);

  const setCurrency = useCallback((currency: string) => {
    dispatch({ type: "SET_CURRENCY", payload: currency });
  }, []);

  const setDecimalPlaces = useCallback((places: number) => {
    dispatch({ type: "SET_DECIMAL_PLACES", payload: places });
  }, []);

  const setTheme = useCallback((theme: "light" | "dark") => {
    dispatch({ type: "SET_THEME", payload: theme });
  }, []);

  const getCurrentScenario = useCallback(() => {
    return state.scenarios.find((s) => s.id === state.currentScenarioId);
  }, [state.scenarios, state.currentScenarioId]);

  const saveState = useCallback(async () => {
    try {
      await AsyncStorage.setItem("mortgageState", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state:", error);
    }
  }, [state]);

  const loadState = useCallback(async () => {
    try {
      const savedState = await AsyncStorage.getItem("mortgageState");
      if (savedState) {
        dispatch({ type: "LOAD_STATE", payload: JSON.parse(savedState) });
      }
    } catch (error) {
      console.error("Failed to load state:", error);
    }
  }, []);

  const value: MortgageContextType = {
    state,
    addScenario,
    updateScenario,
    deleteScenario,
    setCurrentScenario,
    setCurrency,
    setDecimalPlaces,
    setTheme,
    getCurrentScenario,
    saveState,
    loadState,
  };

  return (
    <MortgageContext.Provider value={value}>
      {children}
    </MortgageContext.Provider>
  );
}

export function useMortgage(): MortgageContextType {
  const context = useContext(MortgageContext);
  if (!context) {
    throw new Error("useMortgage must be used within MortgageProvider");
  }
  return context;
}

