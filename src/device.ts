import { useMediaQuery } from "react-responsive";
export function useMediaQueries() {
	const isDesktop = useMediaQuery({ minWidth: 1201 });
	const isTablet = useMediaQuery({ minWidth: 701, maxWidth: 1200 });
	const isMobile = useMediaQuery({ maxWidth: 700 });
	const isTabletOrMobile = isMobile || isTablet;
	const isTabletOrDesktop = isDesktop || isTablet;

	return { isMobile, isTablet, isTabletOrMobile, isTabletOrDesktop, isDesktop };
}
