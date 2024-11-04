// Scrape.js
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
  Stack,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LogViewer from "./LogViewer";

const Scrape = () => {
  // Initialize state with data from localStorage if it exists
  const [url, setUrl] = useState(() => {
    const savedUrl = localStorage.getItem('scrapeUrl');
    return savedUrl || '';
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('scrapeData');
    try {
      return savedData ? JSON.parse(savedData) : {};
    } catch (e) {
      console.error('Error parsing stored data:', e);
      return {};
    }
  });

  // Save to localStorage whenever data or url changes
  useEffect(() => {
    localStorage.setItem('scrapeUrl', url);
  }, [url]);

  useEffect(() => {
    localStorage.setItem('scrapeData', JSON.stringify(data));
  }, [data]);

  const handleScraping = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:5009/api/scrape_web?url=${encodeURIComponent(url)}`
      );
      setData(response.data);
      // Save to localStorage immediately after successful response
      localStorage.setItem('scrapeData', JSON.stringify(response.data));
    } catch (error) {
      setError(error.message);
      // Optionally save error state to localStorage
      localStorage.setItem('scrapeError', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleScraping();
    }
  };

  const handleClearData = () => {
    setData({});
    setUrl('');
    setError(null);
    // Clear localStorage
    localStorage.removeItem('scrapeUrl');
    localStorage.removeItem('scrapeData');
    localStorage.removeItem('scrapeError');
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", margin: 2, padding: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">Scrape Content</Typography>
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
          Start Scraping
        </Button>
      </Stack>

      {loading && (
        <Box sx={{ padding: 2, textAlign: "center" }}>Loading...</Box>
      )}

      {error && (
        <Box sx={{ padding: 2, color: "error.main" }}>Error: {error}</Box>
      )}

      {!loading && !error && Object.keys(data).length > 0 && (
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

      <LogViewer taskId={url}/>
    </Paper>
  );
};

export default Scrape;