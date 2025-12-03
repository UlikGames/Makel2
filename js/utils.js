/**
 * Performs linear interpolation to find y for a given x.
 * @param {number} x - The input value.
 * @param {number[]} xValues - Array of x values (must be sorted).
 * @param {number[]} yValues - Array of corresponding y values.
 * @returns {number} - The interpolated y value.
 */
function interpolate(x, xValues, yValues) {
    // Handle out of bounds (clamping) or exact matches
    if (x <= xValues[0]) return yValues[0];
    if (x >= xValues[xValues.length - 1]) return yValues[yValues.length - 1];

    // Find the interval x is in
    for (let i = 0; i < xValues.length - 1; i++) {
        if (x >= xValues[i] && x <= xValues[i + 1]) {
            const x0 = xValues[i];
            const x1 = xValues[i + 1];
            const y0 = yValues[i];
            const y1 = yValues[i + 1];

            // Linear interpolation formula: y = y0 + (x - x0) * (y1 - y0) / (x1 - x0)
            return y0 + (x - x0) * (y1 - y0) / (x1 - x0);
        }
    }
    return 0; // Should not reach here
}

/**
 * Converts degrees to radians.
 * @param {number} degrees 
 * @returns {number}
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
