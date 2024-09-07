const _getSection = (markdown, sectionHeading) => {
    const lines = markdown.split('\n');
    let capture = false;
    let sectionContent = '';
    let currentHeadingLevel = null;

    lines.forEach(line => {
        const headingMatch = line.match(/^(#+)\s+(.*)/);

        if (headingMatch) {
            const [fullMatch, hashes, heading] = headingMatch;
            const headingLevel = hashes.length;

            if (heading === sectionHeading) {
                capture = true;
                currentHeadingLevel = headingLevel;
                sectionContent = ''; // Reset to start capturing new section
            } else if (capture && headingLevel <= currentHeadingLevel) {
                capture = false; // Stop capturing when a new section of the same or higher level starts
            }
        }

        if (capture) {
            sectionContent += line + '\n';
        }
    });

    return sectionContent.trim();
};

export const extractMarkdownSections = function (markdown, ...sectionHeadings) {
    let result = "";

    for (let sectionHeading of sectionHeadings) {
        result += _getSection(markdown, sectionHeading) + '\n\n';
    }

    return result.trim();
};
