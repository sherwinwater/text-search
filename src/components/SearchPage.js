// src/components/SearchPage.js
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Paper,
    Tabs,
    Tab,
    IconButton,
} from '@mui/material';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BuildIcon from "@mui/icons-material/Build";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TabPanel } from "./TabPanel";
import SearchText from "./SearchText";

const SearchPage = () => {
    const { taskId } = useParams();
    const [currentTab, setCurrentTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
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

    const handleBack = () => {
        window.close();
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
                    <SearchText defaultTaskId={taskId} />
                </TabPanel>
                <TabPanel value={currentTab} index={1}>
                    {/* Build New Knowledge content */}
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default SearchPage;