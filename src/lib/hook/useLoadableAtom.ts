import type { Atom } from "jotai";
import { useAtomValue } from "jotai";
import type { Loadable } from "jotai/vanilla/utils/loadable";

export const useLoadableAtom = <T>(
	loadableAtom: Atom<Loadable<Promise<T>>>,
): T | undefined => {
	const value = useAtomValue(loadableAtom);
	if (value.state === "hasData") {
		return value.data;
	}
	return undefined;
};
