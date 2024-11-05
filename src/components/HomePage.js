import SearchText from "./SearchText";
import BuildIndex from "./BuildIndex";
import Scrape from "./Scrape";
import { TabPanel } from "./TabPanel";

import React, { useState } from "react";
import { Box, Paper, Tabs, Tab } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BuildIcon from "@mui/icons-material/Build";

const HomePage = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const tabHoverStyles = {
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "secondary.light",
      color: "primary.contrastText",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="primary"
          centered
        >
          <Tab
            label="Scrape"
            icon={<UploadFileIcon />}
            iconPosition="start"
            sx={tabHoverStyles}
          />
          <Tab
            label="Build Index"
            icon={<BuildIcon />}
            iconPosition="start"
            sx={tabHoverStyles}
          />
          <Tab
            label="Search Text"
            icon={<SearchIcon />}
            iconPosition="start"
            sx={tabHoverStyles}
          />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Scrape />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <BuildIndex />
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <SearchText />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default HomePage;
