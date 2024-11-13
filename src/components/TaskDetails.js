import React from 'react';
import {
    Box,
    Typography,
    Chip,
} from '@mui/material';

const TaskDetails = ({taskId, scrapingUrl, status, createdAt, processedFiles}) => {
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
                    {taskId}
                </Typography>
            </Box>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">Scraping URL</Typography>
                <Typography variant="body1">
                    {scrapingUrl}
                </Typography>
            </Box>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip
                    label={status}
                    color={status === 'completed' ? 'success' : 'warning'}
                    size="small"
                    sx={{textTransform: 'capitalize', mt: 0.5}}
                />
            </Box>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                <Typography variant="body1">
                    {createdAt}
                </Typography>
            </Box>
            <Box>
                <Typography variant="subtitle2" color="text.secondary">Files</Typography>
                <Typography variant="body1">
                    {processedFiles}
                </Typography>
            </Box>
        </Box>
    );
};

export default TaskDetails;