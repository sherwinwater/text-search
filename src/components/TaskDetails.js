import React, { useEffect } from 'react';
import {
    Box,
    Typography,
    Chip,
} from '@mui/material';

const TaskDetails = ({
                         taskId,
                         scrapingUrl,
                         status,
                         createdAt,
                         processedFiles,
                         onUpdateDetails  // New prop for handling data updates
                     }) => {
    // Effect to save task details when they're available
    useEffect(() => {
        if (taskId && onUpdateDetails) {
            const taskDetails = {
                task_id: taskId,
                scraping_url: scrapingUrl,
                status: status,
                created_at: createdAt,
                processed_files: processedFiles
            };
            onUpdateDetails(taskDetails);
        }
    }, [taskId, scrapingUrl, status, createdAt, processedFiles, onUpdateDetails]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(',', '');
    };

    return (
        <Box sx={{
            display: 'flex',
            gap: 3,
            flexWrap: 'nowrap',
            alignItems: 'center',
            paddingX: 3,
            paddingY: 0
        }}>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">Task ID</Typography>
                <Typography variant="body1">
                    {taskId || '-'}
                </Typography>
            </Box>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">KnowledgeBase URL</Typography>
                <Typography variant="body1">
                    {scrapingUrl || '-'}
                </Typography>
            </Box>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                {status ? (
                    <Chip
                        label={status}
                        color={status === 'completed' ? 'success' : 'warning'}
                        size="small"
                        sx={{textTransform: 'capitalize', mt: 0.5}}
                    />
                ) : (
                    <Typography variant="body1">-</Typography>
                )}
            </Box>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                <Typography variant="body1">
                    {createdAt ? formatDate(createdAt) : '-'}
                </Typography>
            </Box>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">Files</Typography>
                <Typography variant="body1">
                    {processedFiles || '-'}
                </Typography>
            </Box>
        </Box>
    );
};

export default TaskDetails;