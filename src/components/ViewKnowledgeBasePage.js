import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Paper,
    Tabs,
    Tab,
    Typography,
    CircularProgress,
    IconButton,
    Chip
} from '@mui/material';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BuildIcon from "@mui/icons-material/Build";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TabPanel } from "./TabPanel";
import { config } from '../config/config';
import WebpageNetwork from "./WebpageNetwork";

const ViewKnowledgeBasePage = () => {
    const { taskId } = useParams();
    const [currentTab, setCurrentTab] = useState(0);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!taskId) return;

            try {
                setLoading(true);
                const response = await axios.get(`${config.SEARCH_ENGINE_API_URL}/api/text_index/${taskId}`);
                setData(response.data);
                console.log("data", response.data);
            } catch (err) {
                setError('Failed to fetch knowledge base details');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [taskId]);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleBack = () => {
        window.close();
    };

    const tabStyles = {
        backgroundColor: '#f0f4f8',
        marginRight: 1,
        transition: 'none !important',
        "& *": {
            transition: 'none !important',
        },
        "&:hover": {
            backgroundColor: "#e3f2fd",
            color: "#1976d2",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        },
        "&.Mui-selected": {
            backgroundColor: "#bbdefb",
            color: "#1565c0",
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            );
        }

        if (error || !data) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <Typography color="error">{error || 'No data found'}</Typography>
                </Box>
            );
        }

        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Knowledge Base Details
                    </Typography>
                </Box>

                <Box sx={{ display: 'grid', gap: 3 }}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'grid', gap: 2 }}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Task ID</Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{data.task_id}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                <Chip
                                    label={data.status}
                                    color={data.status === 'completed' ? 'success' : 'warning'}
                                    size="small"
                                    sx={{ textTransform: 'capitalize', mt: 0.5 }}
                                />
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                                <Typography variant="body1">{new Date(data.created_at).toLocaleString()}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Progress</Typography>
                                <Typography variant="body1">{data.progress_percentage.toFixed(1)}%</Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Files</Typography>
                                <Typography variant="body1">
                                    {data.processed_files} / {data.total_files} processed
                                </Typography>
                            </Box>

                            {data.message && (
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Message</Typography>
                                    <Typography variant="body1">{data.message}</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Box>

                <Box >
                    {data.webpage_graph && (
                        <WebpageNetwork data={data.webpage_graph} />
                    )}
                </Box>
            </Box>
        );
    };

    return (
        <Box sx={{ width: "100%", p: 3 }}>
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                    backgroundColor: 'background.paper',
                }}
            >
                <Paper
                    sx={{
                        width: "100%",
                        mb: 2,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        indicatorColor="secondary"
                        textColor="primary"
                        centered
                        sx={{
                            '& .MuiTabs-indicator': {
                                height: 3,
                                transition: 'none !important',
                                animation: 'none !important',
                            },
                            '& .MuiTab-root': {
                                transition: 'none !important',
                            },
                            '& *': {
                                transition: 'none !important',
                                animation: 'none !important',
                            }
                        }}
                    >
                        <Tab
                            label="Knowledge Base"
                            icon={<UploadFileIcon />}
                            iconPosition="start"
                            sx={tabStyles}
                        />
                        <Tab
                            label="Build New Knowledge"
                            icon={<BuildIcon />}
                            iconPosition="start"
                            sx={tabStyles}
                        />
                    </Tabs>
                </Paper>
            </Box>

            <Box sx={{ display: 'flex', px: 2, mb: 2 }}>
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
            </Box>

            <Paper sx={{ width: "100%" }}>
                <TabPanel value={currentTab} index={0}>
                    {renderContent()}
                </TabPanel>
                <TabPanel value={currentTab} index={1}>
                    {/* Build New Knowledge content */}
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default ViewKnowledgeBasePage;