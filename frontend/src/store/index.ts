import { create } from "zustand";
import { createAlertSlice } from "./alertSlice";
import { createUserSlice } from "./userSlice";

export const useBoundStore = create((set) => ({
    ...createAlertSlice(set),
    ...createUserSlice(set)
}))