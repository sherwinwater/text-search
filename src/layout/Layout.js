// Layout.jsx
import React from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BuildIcon from "@mui/icons-material/Build";
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Simplified tab value calculation
    const getCurrentTab = () => {
        return location.pathname.includes('/build') ? 1 : 0;
    };

    // Direct navigation on tab change
    const handleTabChange = (event, newValue) => {
        // Force navigation to main routes regardless of current location
        if (newValue === 0) {
            navigate('/knowledge-base', { replace: true }); // Using replace to avoid navigation stack issues
        } else {
            navigate('/build', { replace: true });
        }
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

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1200,
                    backgroundColor: 'background.paper',
                }}
            >
                <Paper
                    sx={{
                        width: "100%",
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <Tabs
                        value={getCurrentTab()}
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
                            onClick={() => navigate('/knowledge-base', { replace: true })}
                        />
                        <Tab
                            label="Build New Knowledge"
                            icon={<BuildIcon />}
                            iconPosition="start"
                            sx={tabStyles}
                            onClick={() => navigate('/build', { replace: true })}
                        />
                    </Tabs>
                </Paper>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    mt: '64px',
                    width: '100%',
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default Layout;