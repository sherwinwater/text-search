import React, { useState } from "react";
import { Box, Paper, Tabs, Tab } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BuildIcon from "@mui/icons-material/Build";
import { TabPanel } from "./TabPanel";
import SearchText from "./SearchText";
import UnifiedScrapeAndIndex from "./UnifiedScrapeAndIndex";

const HomePage = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const tabStyles = {
    backgroundColor: "#f0f4f8",
    marginRight: 1,
    transition: "none !important",
    "& *": {
      transition: "none !important",
    },
    "&:hover": {
      backgroundColor: "#e3f2fd",
      color: "#1976d2",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    "&.Mui-selected": {
      backgroundColor: "#bbdefb",
      color: "#1565c0",
    },
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          backgroundColor: "background.paper",
        }}
      >
        <Paper
          sx={{
            width: "100%",
            mb: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            indicatorColor="secondary"
            textColor="primary"
            centered
            sx={{
              "& .MuiTabs-indicator": {
                height: 3,
                transition: "none !important",
                animation: "none !important",
              },
              "& .MuiTab-root": {
                transition: "none !important",
              },
              "& *": {
                transition: "none !important",
                animation: "none !important",
              },
            }}
          >
            <Tab
              label="Build Search Index"
              icon={<BuildIcon />}
              iconPosition="start"
              sx={tabStyles}
            />
            <Tab
              label="Search"
              icon={<SearchIcon />}
              iconPosition="start"
              sx={tabStyles}
            />
          </Tabs>
        </Paper>
      </Box>

      <Paper sx={{ width: "100%" }}>
        <TabPanel value={currentTab} index={0}>
          <UnifiedScrapeAndIndex />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <SearchText />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default HomePage;
