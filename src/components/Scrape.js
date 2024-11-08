import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TextField,
  Button,
  Stack
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LogViewer from "./LogViewer";
import { config } from "../config/config";
import WebpageNetwork from "./WebpageNetwork";

const POLLING_INTERVAL = 5000; // 5 seconds

const Scrape = () => {
  const [url, setUrl] = useState(() => {
    const savedUrl = localStorage.getItem("scrapeUrl");
    return savedUrl || "";
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [webpageGraph, setWebpageGraph] = useState(null);
  const [parentQueuedLogs, setParentQueuedLogs] = useState([]);

  const handleQueuedLogsChange = (logs) => {
    setParentQueuedLogs(logs);
  };

  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem("scrapeData");
    try {
      return savedData ? JSON.parse(savedData) : {};
    } catch (e) {
      console.error("Error parsing stored data:", e);
      return {};
    }
  });

  // Save to localStorage whenever data or url changes
  useEffect(() => {
    localStorage.setItem("scrapeUrl", url);
  }, [url]);

  useEffect(() => {
    localStorage.setItem("scrapeData", JSON.stringify(data));
  }, [data]);

  // Polling effect
  useEffect(() => {
    let pollInterval;

    const checkStatus = async () => {
      if (!taskId) return;

      try {
        const response = await axios.get(
          `${config.SEARCH_ENGINE_API_URL}/api/scrape_status/${taskId}`
        );

        setData((prevData) => ({
          ...prevData,
          message: response.data.status,
        }));

        if (response.data.status === "completed") {
          setWebpageGraph(response.data.webpage_graph);
          setLoading(false);
          clearInterval(pollInterval);
        } else if (response.data.status === "failed") {
          setError("Scraping process failed");
          setLoading(false);
          clearInterval(pollInterval);
        }
      } catch (error) {
        setError(error.message);
        setLoading(false);
        clearInterval(pollInterval);
      }
    };

    if (loading && taskId) {
      // Start polling
      checkStatus(); // Initial check
      pollInterval = setInterval(checkStatus, POLLING_INTERVAL);
    }

    // Cleanup function
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [taskId, loading]);

  const handleScraping = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setWebpageGraph(null);
    localStorage.removeItem("scrapeData");

    try {
      const response = await axios.get(
        `${
          config.SEARCH_ENGINE_API_URL
        }/api/scrape_web?url=${encodeURIComponent(url)}`
      );

      setData(response.data);
      setTaskId(response.data.task_id);
      localStorage.setItem("scrapeData", JSON.stringify(response.data));
    } catch (error) {
      setError(error.message);
      setLoading(false);
      localStorage.setItem("scrapeError", error.message);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleScraping();
    }
  };

  const handleClearData = () => {
    setData({});
    setUrl("");
    setError(null);
    setTaskId(null);
    setWebpageGraph(null);
    setLoading(false);
    localStorage.removeItem("scrapeUrl");
    localStorage.removeItem("scrapeData");
    localStorage.removeItem("scrapeError");
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", margin: 1, padding: 1 }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ marginBottom: 3 }}
        alignItems="center"
      >
        <TextField
          fullWidth
          label="Enter URL to scrape"
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ maxWidth: 1100 }}
        />
        <Button
          variant="contained"
          onClick={handleScraping}
          disabled={loading || !url.trim()}
          startIcon={<UploadFileIcon />}
        >
          {loading ? "Scraping..." : "Start Scraping"}
        </Button>
        {Object.keys(data).length > 0 && (
            <Button
                variant="outlined"
                color="secondary"
                onClick={handleClearData}
                size="small"
            >
              Clear Data
            </Button>
        )}
      </Stack>

      {loading && (
        <Box sx={{ padding: 2, textAlign: "center" }}>
          Scraping in progress... This may take a few minutes.
        </Box>
      )}

      {error && (
        <Box sx={{ padding: 2, color: "error.main" }}>Error: {error}</Box>
      )}

      {!error && Object.keys(data).length > 0 && (
        <TableContainer sx={{ maxHeight: 900 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Task ID</TableCell>
                <TableCell>Scraping Status</TableCell>
                <TableCell>URL Scraped</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                hover
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{data.task_id}</TableCell>
                <TableCell sx={{ maxWidth: 1100 }}>
                  <Box className="whitespace-pre-wrap break-words max-w-md text-sm">
                    {data.message}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      maxWidth: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {url}
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && !error && Object.keys(data).length === 0 && url && (
        <Box sx={{ padding: 2, textAlign: "center", color: "text.secondary" }}>
          No content found for this URL.
        </Box>
      )}

      <Box sx={{ flexGrow: 1 }}>
        <LogViewer taskId={url} onQueuedLogsChange={handleQueuedLogsChange} />
      </Box>

      {webpageGraph && parentQueuedLogs.length === 1 && (
        <Box sx={{ flexGrow: 1, minHeight: "700px" }}>
          <WebpageNetwork data={webpageGraph} />
        </Box>
      )}
    </Paper>
  );
};

export default Scrape;
