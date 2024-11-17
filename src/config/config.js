export const config = {
    SEARCH_ENGINE_API_URL: (process.env.REACT_APP_SEARCH_ENGINE_API_URL || 'https://search-engine.shuwen.cloud').trim(),
    KNOWLEDGE_BASE_STORAGE_KEY: 'knowledgeBaseData',
    SEARCH_STORAGE_KEY: 'searchData'
};

// Helper function to ensure URL is properly formatted
const formatApiUrl = (url) => {
    if (!url) return '';
    // First trim any whitespace
    url = url.trim();
    // Remove trailing slashes
    return url.replace(/\/+$/, '');
};

// Format the URL before exporting
config.SEARCH_ENGINE_API_URL = formatApiUrl(config.SEARCH_ENGINE_API_URL);

const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment) {
    console.log('Running in development mode. API URL:', config.SEARCH_ENGINE_API_URL);
} else {
    console.log('Running in production mode. API URL:', config.SEARCH_ENGINE_API_URL);
}

export const STORAGE_KEYS = {
    KNOWLEDGE_BASE: 'knowledgeBaseData',
    SEARCH: 'searchData'
};