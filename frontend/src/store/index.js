import { create } from "zustand";
import { createAlertSlice } from "./alertSlice";
import { createUserSlice } from "./userSlice";

export const useBoundStore = create((...a) => ({
    ...createAlertSlice(...a),
    ...createUserSlice(...a)
}))