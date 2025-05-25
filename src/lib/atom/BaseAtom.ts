import { atomWithReset } from "jotai/utils";

export const toastAtom = atomWithReset({ status: "", message: "" });
