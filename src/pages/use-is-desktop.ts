import { useState, useEffect } from "react";

const useIsDesktop = () => {
    const [isDesktop, setIsDesktop] = useState(
        window.matchMedia("(min-width: 900px)").matches
    );

    useEffect(() => {
        const media = window.matchMedia("(min-width: 900px)");
        const listener = () => setIsDesktop(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, []);

    return isDesktop;
};

export default useIsDesktop;
