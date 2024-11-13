import BuildIndex from "./BuildIndex";
import { TabPanel } from "./TabPanel";

import React, { useState } from "react";
import { Box, Paper, Tabs, Tab } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BuildIcon from "@mui/icons-material/Build";
import KnowledgeBase from "./KnowledgeBase";

const HomePage = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

    const tabStyles = {
        backgroundColor: '#f0f4f8', // Light blue-gray background
        marginRight: 1,
        transition: 'none !important', // Remove tab transitions
        "& *": { // Target all children elements
            transition: 'none !important',
        },
        "&:hover": {
            backgroundColor: "#e3f2fd", // Light blue on hover
            color: "#1976d2", // Primary blue color
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        },
        "&.Mui-selected": {
            backgroundColor: "#bbdefb", // Slightly darker blue for selected tab
            color: "#1565c0", // Darker blue for text
        }
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
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Add shadow for sticky header
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
                    // Target all possible transitions
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

        <Paper sx={{ width: "100%" }}>
          <TabPanel value={currentTab} index={0}>
            <KnowledgeBase />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <BuildIndex />
          </TabPanel>
        </Paper>
      </Box>
  );
};

export default HomePage;