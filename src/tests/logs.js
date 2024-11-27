const sampleLogs = [
    {
        timestamp: "2024-11-27T10:00:00.000Z",
        level: "info",
        message: "Starting web crawler initialization"
    },
    {
        timestamp: "2024-11-27T10:00:01.234Z",
        level: "debug",
        message: "Configuring crawler settings: maxDepth=3, concurrent=5"
    },
    {
        timestamp: "2024-11-27T10:00:02.456Z",
        level: "info",
        message: "Starting crawl for URL: https://example.com"
    },
    {
        timestamp: "2024-11-27T10:00:03.789Z",
        level: "debug",
        message: "Found 15 links on homepage"
    },
    {
        timestamp: "2024-11-27T10:00:04.123Z",
        level: "warning",
        message: "Rate limit approaching - 80% of quota used"
    },
    {
        timestamp: "2024-11-27T10:00:05.456Z",
        level: "info",
        message: "Processing page: https://example.com/about"
    },
    {
        timestamp: "2024-11-27T10:00:06.789Z",
        level: "error",
        message: "Failed to fetch https://example.com/broken-link - 404 Not Found"
    },
    {
        timestamp: "2024-11-27T10:00:07.234Z",
        level: "info",
        message: "Extracted content from page: About Us"
    },
    {
        timestamp: "2024-11-27T10:00:08.567Z",
        level: "debug",
        message: "Processing images: found 8 images on page"
    },
    {
        timestamp: "2024-11-27T10:00:09.890Z",
        level: "warning",
        message: "Slow response time detected - 2.5s for https://example.com/products"
    },
    {
        timestamp: "2024-11-27T10:00:10.123Z",
        level: "info",
        message: "Processing page: https://example.com/products"
    },
    {
        timestamp: "2024-11-27T10:00:11.456Z",
        level: "error",
        message: "Database connection timeout - retrying in 5s"
    },
    {
        timestamp: "2024-11-27T10:00:12.789Z",
        level: "info",
        message: "Database connection restored"
    },
    {
        timestamp: "2024-11-27T10:00:13.234Z",
        level: "debug",
        message: "Cache hit ratio: 75%"
    },
    {
        timestamp: "2024-11-27T10:00:14.567Z",
        level: "info",
        message: "Processing page: https://example.com/contact"
    },
    {
        timestamp: "2024-11-27T10:00:15.890Z",
        level: "debug",
        message: "Form elements detected: 6"
    },
    {
        timestamp: "2024-11-27T10:00:16.123Z",
        level: "info",
        message: "Starting content extraction"
    },
    {
        timestamp: "2024-11-27T10:00:17.456Z",
        level: "warning",
        message: "Memory usage high: 85%"
    },
    {
        timestamp: "2024-11-27T10:00:18.789Z",
        level: "info",
        message: "Indexing extracted content"
    },
    {
        timestamp: "2024-11-27T10:00:19.234Z",
        level: "debug",
        message: "Document count: 127"
    }
];

// Function to generate more logs with updated timestamps
const generateMoreLogs = (baseTime = new Date(), count = 200) => {
    return Array.from({ length: count }, (_, i) => {
        const timestamp = new Date(baseTime.getTime() + (i * 1000));
        const levels = ['info', 'debug', 'warning', 'error'];
        const level = levels[Math.floor(Math.random() * levels.length)];

        const messages = [
            "Processing new page",
            "Found new links",
            "Extracting content",
            "Updating index",
            "Checking rate limits",
            "Validating URLs",
            "Analyzing page structure",
            "Computing checksums",
            "Updating progress",
            "Checking resources"
        ];

        return {
            timestamp: timestamp.toISOString(),
            level,
            message: `${messages[Math.floor(Math.random() * messages.length)]} - ID: ${Math.floor(Math.random() * 1000)}`
        };
    });
};

// Example usage:
// const moreLogs = generateMoreLogs(new Date(), 20);

export { sampleLogs, generateMoreLogs };