function cssColorToHex(cssColor: string): string {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;

    const ctx = canvas.getContext("2d");
    if (!ctx) return "#000000";

    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);

    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

    return (
        "#" +
        [r, g, b]
            .map(v => v.toString(16).padStart(2, "0"))
            .join("")
    );
}

function cssVariableToHex(variable: string) {
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();

    const temp = document.createElement("div");

    temp.style.color = value;

    // important for light-dark()
    temp.style.colorScheme = getComputedStyle(document.documentElement).colorScheme;

    document.body.appendChild(temp);

    const computed = getComputedStyle(temp).color;
    document.body.removeChild(temp);

    const hex = cssColorToHex(computed);

    return hex;
}

export { cssColorToHex, cssVariableToHex };
