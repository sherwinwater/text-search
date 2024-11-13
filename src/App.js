// src/App.js
import "./App.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from "./components/HomePage";
import ViewKnowledgeBasePage from "./components/ViewKnowledgeBasePage";
import SearchPage from "./components/SearchPage";

function App() {
    return (
        <div className="App">
            <header className="App-header"></header>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/knowledge-base/view/:taskId" element={<ViewKnowledgeBasePage />} />
                    <Route path="/search/:taskId" element={<SearchPage />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;