// src/pages/SearchPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import SearchText from "../components/SearchText";
import TaskDetails from "../components/TaskDetails";
import { config } from '../config/config';

const SearchPage = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [pageData, setPageData] = useState(() => {
        try {
            const storedData = localStorage.getItem(config.KNOWLEDGE_BASE_STORAGE_KEY);
            return storedData ? JSON.parse(storedData) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    });

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

    const handleTaskDetails = (details) => {
        const updatedData = {
            ...pageData,
            ...details
        };
        setPageData(updatedData);
        localStorage.setItem(config.KNOWLEDGE_BASE_STORAGE_KEY, JSON.stringify(updatedData));
    };

    const handleBack = () => {
        localStorage.removeItem(config.KNOWLEDGE_BASE_STORAGE_KEY);
        localStorage.removeItem(config.SEARCH_STORAGE_KEY);
        if (window.history.length <= 1) {
            window.close();
        } else {
            navigate('/knowledge-base', { replace: true });
        }
    };

    const handleClose = () => {
        handleBack()
    };

    return (
        <Box sx={{ p: 2, mt: 2 }}>
            <Box sx={{ mb: 2 }}>
                <Box sx={{
                    display: 'flex',
                    px: 2,
                    mb: 2,
                    alignItems: 'center',
                    gap: 2,
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            onClick={handleBack}
                            sx={{
                                backgroundColor: '#f0f4f8',
                                '&:hover': {
                                    backgroundColor: '#e3f2fd',
                                }
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6">
                            Search Results
                        </Typography>
                    </Box>

                    {/* Close button */}
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            backgroundColor: '#f0f4f8',
                            '&:hover': {
                                backgroundColor: '#e3f2fd',
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Task Details */}
            <TaskDetails
                taskId={pageData?.task_id}
                scrapingUrl={pageData?.scraping_url}
                status={pageData?.status}
                createdAt={pageData?.created_at}
                processedFiles={pageData?.processed_files}
                onUpdateDetails={handleTaskDetails}
            />

            {/* Search Text */}
            <SearchText
                defaultTaskId={taskId}
                onSearchUpdate={handleTaskDetails}
            />
        </Box>
    );
};

export default SearchPage;