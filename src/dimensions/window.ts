import { useEffect, useMemo, useState } from "react"
import { Orientation, ScreenDimensions } from "."
import { isSsrUnsafe } from "@teawithsand/tws-lts-react"

export const getWindowDimensions = (): ScreenDimensions => {
	const { innerWidth: width, innerHeight: height } = window
	let orientation: Orientation = "square"
	if (width > height) {
		orientation = "horizontal"
	} else if (height > width) {
		orientation = "vertical"
	}
	return {
		width,
		height,
		orientation,
	}
}

export const useWindowDimensions = (
	ssrInitialize?: ScreenDimensions
): ScreenDimensions => {
	if (typeof ssrInitialize === "undefined" && isSsrUnsafe()) throw new Error("Running SSR, but no SSR fallback provided!")


	const [windowDimensions, setWindowDimensions] = useState(
		() => ssrInitialize ?? getWindowDimensions()
	)

	useEffect(() => {
		function handleResize() {
			const dimensions = getWindowDimensions()
			setWindowDimensions(dimensions)
		}

		handleResize()

		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [setWindowDimensions])

	return windowDimensions
}

/**
 * Hook, which watches using window.matchMedia method to determine whether viewport matches specific viewport or not.
 */
export const useMatchMedia = (
	query: string,
	ssrInitialize?: boolean
): boolean => {
	if (typeof ssrInitialize === "undefined" && isSsrUnsafe()) throw new Error("Running SSR, but no SSR fallback provided!")

	const [matches, setMatches] = useState(
		() => ssrInitialize ?? window.matchMedia(query).matches
	)

	useEffect(() => {
		const mql = window.matchMedia(query)
		const listener = (value: MediaQueryListEvent) => {
			setMatches(value.matches)
		}
		setMatches(mql.matches)

		mql.addEventListener("change", listener)

		return () => {
			mql.removeEventListener("change", listener)
		}
	}, [query, setMatches])

	return matches
}
