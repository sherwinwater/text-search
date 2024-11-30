# Universal Open-Source Documentation Search Engine

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Frontend Features](#frontend-features)
- [Browser Extension Features](#browser-extension-features)
- [Implementation Details](#implementation-details)
- [Development and Testing](#development-and-testing)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [License](#license)

## Overview
Many open-source libraries lack effective search functionality in their documentation. For example, Apache Storm (version 2.7.0) has no search feature at all, making it difficult for developers to find relevant information quickly. While some documentation sites provide basic search capabilities, they often use simple keyword matching that yields suboptimal results.

Our project aims to develop a universal documentation search engine that can enhance any open-source library's documentation searchability. Users will simply provide the documentation URL, and our system will automatically scrape, index, and make the content searchable using BM25 ranking for improved relevance.

## System Architecture
![img_12.png](img_12.png)
## Installation

### Prerequisites
- Node.js v22+
- Python 3.10+
- Chrome Browser

### Component Setup

#### 1. Backend Setup
```bash
# Clone the backend repository
git clone git@github.com:sherwinwater/search-engine.git
cd search-engine

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
flask --app api/app.py run --port 5009

or
python -m flask --app api/app.py run --port 5009
```

#### 2. Frontend Setup
```bash
# Clone the frontend repository
git clone git@github.com:sherwinwater/text-search.git
cd text-search

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configurations

# Start development server
npm start
```

#### 3. Browser Extension Setup
```bash
# Clone the extension repository
git clone git@github.com:sherwinwater/text-search-browser-extension.git
cd text-search-browser-extension
```
Load in Chrome:
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select folder's content

## Usage Guide

### Basic Usage Flow

#### 1. Building Knowledge Base
- Navigate to "Build New Knowledge" tab and enter documentation URL
- URLs must be properly formatted (e.g., https://example.com)
- System automatically validates URL format
- Click "Build New Knowledge" to start indexing
![img_1.png](img_1.png)

#### 2. Monitoring Build Progress
- Watch real-time status updates in the live logging window
- View build status indicators and indexing progress
- Option to cancel building process or clear build information
![img_2.png](img_2.png)

#### 3. Exploring Knowledge Base
##### 3.1 Knowledge Base Overview
- Access comprehensive list of indexed documentation
- View key information: Task ID, URL, processed files, status, creation time
- Use available actions: View, Search, or open in new tab (via right-click)
![img_7.png](img_7.png)

##### 3.2 Detailed Knowledge View
- Click "View" to access detailed visualizations and content
- Explore interactive network visualization of document relationships
- Access page metrics and direct URL links
![img_3.png](img_3.png)

##### 3.3 Document Clusters
- Browse organized clusters of related documents
- View document count, key terms, and content previews
- Filter clusters by keywords or topics
![img_4.png](img_4.png)

##### 3.4 Cluster Search
- Use search functionality to filter clusters, documents, or keywords
- View real-time results with keyword highlighting
- Access direct links to source documentation
![img_5.png](img_5.png)

#### 4. Searching Documentation
##### 4.1 Initiating Search
- Click "Search" button from knowledge base entry
- Access search through knowledge base viewer
- Use browser extension for quick access
![img_6.png](img_6.png)

##### 4.2 Search Results
- View results with relevance scores and highlighted matches
- Access content previews and direct URL links
- Open results in new tabs as needed
![img_8.png](img_8.png)

### Advanced Features

#### Page Graph Visualization
- Interactive network view of document relationships
- Control panel with layout options:
  - Fit View: Optimize for current window
  - Stabilize: Improve network layout
  - Spread/Compact/Default: Adjust visualization style
  - Toggle edge visibility
- Real-time network statistics and metrics
![img_10.png](img_10.png)

#### Content Clustering
- Automated organization of related documents
- Cluster information display:
  - Document counts
  - Key terms and topics
  - Content previews
- Advanced filtering and search capabilities

#### Text Summarization
- Automated content summaries
- Key points extraction
- Quick document overview
![img_11.png](img_11.png)

#### Fuzzy Search Capabilities
- Typo-tolerant search functionality
- Suggested query corrections
- Relevance-based results ranking
![img_9.png](img_9.png)

#### Browser Extension Integration
- Quick access through context menu
- Keyboard shortcut support
- Customizable search preferences
- Recent search history

### Tips for Optimal Use

#### Building Effective Knowledge Bases
- Always include complete URL with protocol (http/https)
- Allow indexing to complete before searching
- Monitor build progress through live logs
- Use clear build for fresh indexing

#### Searching Efficiently
- Utilize specific keywords for better results
- Consider suggested queries when provided
- Preview content before opening links
- Use right-click options for new tab navigation

#### Maximizing Visualization Benefits
- Adjust layouts based on network size
- Combine cluster browsing with search
- Use filters to focus on relevant content
- Monitor network statistics for insights

## API Documentation

### Base URL
```
http://localhost:5009
```

### Authentication
No authentication required for basic usage.

### Core Endpoints

#### 1. Start Documentation Indexing
```http
POST /api/build_index_by_url
Content-Type: application/json

{
    "url": "https://docs.example.com",
    "max_pages": 50
}
```

#### 2. Search Documentation
```http
POST /api/search_url
Content-Type: application/json

{
    "url": "https://docs.example.com",
    "query": "search term"
}
```

#### 3. Get Indexing Status
```http
GET /api/clustering_status/{task_id}
```

### WebSocket Events
- `connect`: Client connection
- `join`: Room subscription
- `log_message`: Task updates
- `status`: Status changes


## Frontend Features

### Pages
1. **Home**
   - URL input
   - Recent searches
   - Popular documentation

2. **Search Results**
   - Ranked results
   - Content preview
   - Document clusters

3. **Documentation View**
   - Original content
   - Search highlighting
   - Navigation sidebar

## Browser Extension Features

### Core Features
1. **Quick Search**
   - Keyboard shortcuts
   - Context menu integration
   - Search history

2. **Settings**
   - Default search behavior
   - Results display preferences
   - Custom shortcuts

## Implementation Details

### Technology Stack

#### Backend
- Flask (API Server)
- PostgreSQL (Database)
- Socket.IO (Real-time Updates)
- BM25 (Search Algorithm)

#### Frontend
- React
- Redux (State Management)
- Tailwind CSS
- Socket.IO Client

#### Browser Extension
- React
- Chrome Extension APIs
- Webpack

### Key Components

#### Search Engine
- Document scraping
- Text indexing
- Content clustering
- Relevance ranking

#### Real-time Updates
- WebSocket integration
- Progress tracking
- Status notifications

## Development and Testing

### Testing Strategy
1. **Unit Tests**
   ```bash
   # Backend
   python -m pytest tests/
   
   # Frontend
   npm test
   
   # Extension
   npm test
   ```

2. **Integration Tests**
   ```bash
   pytest tests/integration/
   ```

### Development Workflow
1. Fork repository
2. Create feature branch
3. Implement changes
4. Submit pull request

## Troubleshooting

### Common Issues

#### Indexing Failures
- **Issue**: Timeout during indexing
   - **Solution**: Increase timeout settings or reduce max_pages

- **Issue**: Memory errors
   - **Solution**: Adjust batch size in configuration

#### Search Problems
- **Issue**: No results found
   - **Solution**: Check URL indexing status

- **Issue**: Incorrect results
   - **Solution**: Verify search query format

## Deployment

### Production Setup

#### Backend Deployment
1. Set up production server
2. Configure environment variables
3. Set up process manager
4. Configure NGINX

#### Frontend Deployment
1. Build production bundle
2. Configure CDN
3. Set up hosting

#### Extension Publishing
1. Build production version
2. Create Chrome Web Store listing
3. Submit for review

## License
MIT License