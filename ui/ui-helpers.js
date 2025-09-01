/**
 * Simple helper function for creating knob CSS styles
 * @param {string} filepath - Path to the knob image
 * @param {Object} size - Size object with width and height
 * @param {number|string} size.width - Width in pixels (number) or CSS unit (string)
 * @param {number|string} size.height - Height in pixels (number) or CSS unit (string)
 * @param {Object} position - Position object with left and top
 * @param {number|string} position.left - Left position in pixels (number) or CSS unit (string)
 * @param {number|string} position.top - Top position in pixels (number) or CSS unit (string)
 * @param {string} [className] - Optional CSS class name. If not provided, generates one based on filepath
 * @returns {Object} Object containing className and CSS string
 */
export function createKnob(filepath, size, position, className) {
    // Generate className if not provided
    if (!className) {
        const filename = filepath.split('/').pop().split('.')[0];
        className = `${filename}-knob`;
    }

    // Helper to add 'px' unit if value is a number
    const addUnit = (value) => typeof value === 'number' ? `${value}px` : value;

    // Generate CSS
    const css = `
.${className} {
    width: ${addUnit(size.width)};
    height: ${addUnit(size.height)};
    background-image: url(${filepath});
    position: absolute;
    left: ${addUnit(position.left)};
    top: ${addUnit(position.top)};
}`;

    return {
        className,
        css
    };
}

/**
 * Creates background CSS styles for elements (like enclosures, panels, etc.)
 * @param {string} filename - Path to the background image
 * @param {Object} size - Size object with width and height
 * @param {number|string} size.width - Width in pixels (number) or CSS unit (string)
 * @param {number|string} size.height - Height in pixels (number) or CSS unit (string)
 * @param {string} [className] - Optional CSS class name. If not provided, generates one based on filename
 * @returns {Object} Object containing className and CSS string
 */
export function createBackground(filename, size, className) {
    // Generate className if not provided
    if (!className) {
        const baseName = filename.split('/').pop().split('.')[0];
        className = `${baseName}-bg`;
    }

    // Helper to add 'px' unit if value is a number
    const addUnit = (value) => typeof value === 'number' ? `${value}px` : value;

    // Generate CSS
    const css = `
.${className} {
    width: ${addUnit(size.width)};
    height: ${addUnit(size.height)};
    background-image: url(${filename});
}`;

    return {
        className,
        css
    };
}

/**
 * Creates a fader CSS with background track and movable thumb
 * @param {string} backgroundPath - Path to the fader background/track image
 * @param {string} thumbPath - Path to the fader thumb/handle image
 * @param {Object} backgroundSize - Background size object {width, height}
 * @param {Object} thumbSize - Thumb size object {width, height}
 * @param {Object} position - Position object {left, top}
 * @param {boolean} isVertical - True for vertical fader, false for horizontal
 * @param {string} [className] - Optional base CSS class name
 * @returns {Object} Object containing classNames and CSS string
 */
export function createFader(backgroundPath, thumbPath, backgroundSize, thumbSize, position, isVertical, className) {
    // Generate className if not provided
    if (!className) {
        const bgName = backgroundPath.split('/').pop().split('.')[0];
        className = `${bgName}-fader`;
    }

    const backgroundClass = `${className}-bg`;
    const thumbClass = `${className}-thumb`;

    // Helper to add 'px' unit if value is a number
    const addUnit = (value) => typeof value === 'number' ? `${value}px` : value;

    // Calculate thumb positioning constraints based on orientation
    const thumbPositioning = isVertical 
        ? `
    left: 50%;
    transform: translateX(-50%);
    top: 0;` 
        : `
    top: 50%;
    transform: translateY(-50%);
    left: 0;`;

    // Generate CSS
    const css = `
.${backgroundClass} {
    width: ${addUnit(backgroundSize.width)};
    height: ${addUnit(backgroundSize.height)};
    background-image: url(${backgroundPath});
    position: absolute;
    left: ${addUnit(position.left)};
    top: ${addUnit(position.top)};
}

.${thumbClass} {
    width: ${addUnit(thumbSize.width)};
    height: ${addUnit(thumbSize.height)};
    background-image: url(${thumbPath});
    position: absolute;${thumbPositioning}
    cursor: pointer;
    z-index: 1;
}`;

    return {
        className,
        backgroundClass,
        thumbClass,
        css
    };
}

/**
 * Creates multiple knobs and returns combined CSS
 * @param {Array} knobs - Array of knob configurations
 * @param {string} knobs[].filepath - Path to the knob image
 * @param {Object} knobs[].size - Size object {width, height}
 * @param {Object} knobs[].position - Position object {left, top}
 * @param {string} [knobs[].className] - Optional CSS class name
 * @returns {Array} Array of objects with className and combined CSS string
 */
export function createKnobs(knobs) {
    const results = knobs.map(({ filepath, size, position, className }) => 
        createKnob(filepath, size, position, className)
    );

    const combinedCSS = results.map(result => result.css).join('\n');

    return {
        knobs: results,
        combinedCSS
    };
}

/**
 * Utility to resolve path relative to import.meta.url
 * @param {string} path - Relative path
 * @param {string} baseUrl - Base URL (typically import.meta.url)
 * @returns {string} Resolved path
 */
export function resolvePath(path, baseUrl) {
    return new URL(path, baseUrl).href;
}