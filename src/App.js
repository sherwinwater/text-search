// App.js
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import KnowledgeBase from "./components/KnowledgeBase";
import BuildIndex from "./components/BuildIndex";
import ViewKnowledgeBasePage from "./components/ViewKnowledgeBasePage";
import SearchPage from "./components/SearchPage";

function App() {
    return (
        <div className="App">
            <header className="App-header"></header>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        {/* Redirect root to knowledge base */}
                        <Route path="/" element={<Navigate to="/knowledge-base" replace />} />

                        {/* Knowledge Base tab and its sub-routes */}
                        <Route path="/knowledge-base" element={<KnowledgeBase />} />
                        <Route path="/knowledge-base/view/:taskId" element={<ViewKnowledgeBasePage />} />
                        <Route path="/knowledge-base/search/:taskId" element={<SearchPage />} />

                        {/* Build tab */}
                        <Route path="/build" element={<BuildIndex />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </div>
    );
}

export default App;