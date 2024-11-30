// App.js
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import KnowledgeBase from "./pages/KnowledgeBase";
import BuildIndex from "./pages/BuildIndex";
import ViewKnowledgeBasePage from "./pages/ViewKnowledgeBasePage";
import SearchPage from "./pages/SearchPage";
import AdminPage from "./components/admin/AdminPage";

const ProtectedRoute = ({ children }) => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (!isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};
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
                        <Route path="/knowledge-base/view/:taskId/:indexId" element={<ViewKnowledgeBasePage />} />
                        <Route path="/knowledge-base/search/:taskId/:indexId" element={<SearchPage />} />

                        {/* Build tab */}
                        <Route path="/build" element={<BuildIndex />} />

                        <Route path="/admin" element={<AdminPage />} />
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute>
                                    <AdminPage />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </div>
    );
}

export default App;