// src/components/SearchPage.js
import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {
    Box,
    IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchText from "../components/SearchText";
import TaskDetails from "../components/TaskDetails";

const SearchPage = () => {
    const {taskId} = useParams();
    const [pageData, setPageData] = useState(null);

    useEffect(() => {
        // Retrieve the data when component mounts
        const storedData = localStorage.getItem('knowledgeBaseData');
        if (storedData) {
            setPageData(JSON.parse(storedData));
            localStorage.removeItem('knowledgeBaseData');
        }
    }, [pageData]);
    const handleBack = () => {
        window.close();
    };

    return (
        <Box sx={{width: "100%", p: 3}}>
            <Box sx={{display: 'flex', px: 2, mb: 2}}>
                <IconButton
                    onClick={handleBack}
                    sx={{
                        backgroundColor: '#f0f4f8',
                        '&:hover': {
                            backgroundColor: '#e3f2fd',
                        }
                    }}
                >
                    <ArrowBackIcon/>
                </IconButton>
            </Box>
            <TaskDetails
                taskId={pageData?.task_id}
                scrapingUrl={pageData?.scraping_url}
                status={pageData?.status}
                createdAt={pageData?.created_at}
                processedFiles={pageData?.processed_files}
            />
            <SearchText defaultTaskId={taskId}/>
        </Box>
    );
};

export default SearchPage;