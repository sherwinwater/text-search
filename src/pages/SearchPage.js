// src/pages/SearchPage.js
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import SearchText from "../components/SearchText";
import { config } from '../config/config';
import TaskTable from "../components/TaskTable";

const SearchPage = () => {
    const { taskId,indexId } = useParams();
    const navigate = useNavigate();
    const storedData = localStorage.getItem(config.KNOWLEDGE_BASE_STORAGE_KEY);
    const pageData = storedData ? JSON.parse(storedData) : null;


    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (event.persisted || window.performance.navigation.type === 1) {
                return;
            }
            localStorage.removeItem(config.KNOWLEDGE_BASE_STORAGE_KEY);
            localStorage.removeItem(config.SEARCH_STORAGE_KEY);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (window.performance.navigation.type !== 1) {
                localStorage.removeItem(config.KNOWLEDGE_BASE_STORAGE_KEY);
                localStorage.removeItem(config.SEARCH_STORAGE_KEY);
            }
        };
    }, []);

    const handleView = (taskId, indexId,event) => {
        const url = `/knowledge-base/view/${taskId}/${indexId}`;
        if (event.button === 2) { // Right-click
            window.open(url, '_blank', 'noopener,noreferrer');
        } else { // Left-click
            navigate(url);
        }
    };

    return (
        <Box sx={{ p: 2, mt: 2 }}>
            <TaskTable
                data={pageData}
                indexId={indexId}
                handleView={(event) => handleView(pageData.task_id, indexId, event)}
            />

            {/* Search Text */}
            <SearchText
                defaultTaskId={taskId}
            />
        </Box>
    );
};

export default SearchPage;