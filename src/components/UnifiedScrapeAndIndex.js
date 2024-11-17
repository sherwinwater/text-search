import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Button,
  Stack,
  Paper,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Tooltip,
  Chip,
  LinearProgress,
  useTheme,
  Divider,
} from "@mui/material";
import {
  UploadFile as UploadFileIcon,
  Build as BuildIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import LogViewer from "./LogViewer";
import WebpageNetwork from "./WebpageNetwork";
import axios from "axios";
import { config } from "../config/config";

const UnifiedScrapeAndIndex = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [url, setUrl] = useState("");
  const [indexName, setIndexName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [webpageGraph, setWebpageGraph] = useState(null);
  const [parentQueuedLogs, setParentQueuedLogs] = useState([]);
  const [scrapeComplete, setScrapeComplete] = useState(false);
  const [indexComplete, setIndexComplete] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [recentJobs, setRecentJobs] = useState(() => {
    const saved = localStorage.getItem("recentJobs");
    return saved ? JSON.parse(saved) : [];
  });
  const [copied, setCopied] = useState(false);
  const networkRef = useRef(null);

  const steps = [
    {
      label: "Configure",
      description: "Enter URL and index name",
    },
    {
      label: "Process",
      description: "Scraping and indexing",
    },
    {
      label: "Complete",
      description: "Ready to search",
    },
  ];

  // Save recent jobs to localStorage
  useEffect(() => {
    localStorage.setItem("recentJobs", JSON.stringify(recentJobs));
  }, [recentJobs]);

  const handleQueuedLogsChange = (logs) => {
    setParentQueuedLogs(logs);
  };

  const addToRecentJobs = () => {
    const newJob = {
      url,
      indexName,
      timestamp: new Date().toISOString(),
      status: "completed",
    };
    setRecentJobs((prev) => [newJob, ...prev.slice(0, 4)]);
  };

  const handleLoadRecentJob = (job) => {
    setUrl(job.url);
    setIndexName(job.indexName);
  };

  const copyIndexName = async () => {
    try {
      await navigator.clipboard.writeText(indexName);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const saveIndexInfo = () => {
    const savedIndexes = localStorage.getItem("builtIndexes");
    const existingIndexes = savedIndexes ? JSON.parse(savedIndexes) : [];

    const newIndex = {
      name: indexName,
      url: url,
      timestamp: new Date().toISOString(),
    };

    const updatedIndexes = [
      ...existingIndexes.filter((idx) => idx.name !== indexName),
      newIndex,
    ];

    localStorage.setItem("builtIndexes", JSON.stringify(updatedIndexes));
  };

  const handleStartProcess = async () => {
    if (!url.trim() || !indexName.trim()) return;

    setLoading(true);
    setError(null);
    setWebpageGraph(null);
    setScrapeComplete(false);
    setIndexComplete(false);
    setActiveStep(1);
    setProcessingProgress(0);

    try {
      const scrapeResponse = await axios.get(
        `${
          config.SEARCH_ENGINE_API_URL
        }/api/scrape_web?url=${encodeURIComponent(url)}`
      );
      setTaskId(scrapeResponse.data.task_id);

      const pollScraping = setInterval(async () => {
        try {
          const statusResponse = await axios.get(
            `${config.SEARCH_ENGINE_API_URL}/api/scrape_status/${scrapeResponse.data.task_id}`
          );

          if (!scrapeComplete) {
            setProcessingProgress((prev) => Math.min(prev + 5, 45));
          }

          if (statusResponse.data.status === "completed") {
            clearInterval(pollScraping);
            setWebpageGraph(statusResponse.data.webpage_graph);
            setScrapeComplete(true);
            setProcessingProgress(50);

            const indexResponse = await axios.get(
              `${
                config.SEARCH_ENGINE_API_URL
              }/api/build_text_index/${encodeURIComponent(indexName)}`
            );

            if (indexResponse.data) {
              setIndexComplete(true);
              setProcessingProgress(100);
              setActiveStep(2);
              setLoading(false);
              addToRecentJobs();
              saveIndexInfo();
            }
          } else if (statusResponse.data.status === "failed") {
            clearInterval(pollScraping);
            setError("Scraping process failed");
            setLoading(false);
          }
        } catch (error) {
          clearInterval(pollScraping);
          setError(error.message);
          setLoading(false);
        }
      }, 5000);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setIndexName("");
    setError(null);
    setTaskId(null);
    setWebpageGraph(null);
    setLoading(false);
    setScrapeComplete(false);
    setIndexComplete(false);
    setActiveStep(0);
    setProcessingProgress(0);
  };

  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        margin: 1,
        padding: 3,
        position: "relative",
      }}
    >
      {/* Main Process Section */}
      <Stack spacing={4}>
        {/* Stepper */}
        <Stepper activeStep={activeStep}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="body2">{step.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Configuration Form */}
        {activeStep === 0 ? (
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Enter URL to scrape"
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              error={error && !url.trim()}
              helperText={error && !url.trim() ? "URL is required" : ""}
            />
            <TextField
              fullWidth
              label="Enter index name"
              variant="outlined"
              value={indexName}
              onChange={(e) => setIndexName(e.target.value)}
              error={error && !indexName.trim()}
              helperText={
                error && !indexName.trim() ? "Index name is required" : ""
              }
            />
            <Button
              variant="contained"
              onClick={handleStartProcess}
              disabled={loading || !url.trim() || !indexName.trim()}
              startIcon={
                loading ? <CircularProgress size={20} /> : <UploadFileIcon />
              }
            >
              {loading ? "Processing..." : "Start Process"}
            </Button>
          </Stack>
        ) : (
          <Box>
            <Stack spacing={2}>
              {/* Progress Bar */}
              {loading && (
                <Box sx={{ width: "100%" }}>
                  <LinearProgress
                    variant="determinate"
                    value={processingProgress}
                    sx={{ mb: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    {!scrapeComplete
                      ? "Scraping in progress..."
                      : "Building index..."}{" "}
                    ({processingProgress}%)
                  </Typography>
                </Box>
              )}

              {/* Status Messages */}
              {error && (
                <Alert
                  severity="error"
                  action={
                    <Button color="inherit" size="small" onClick={handleReset}>
                      Try Again
                    </Button>
                  }
                >
                  {error}
                </Alert>
              )}

              {scrapeComplete && (
                <Alert severity="success">
                  Scraping completed successfully!
                </Alert>
              )}

              {indexComplete && (
                <Alert
                  severity="success"
                  action={
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Copy Index Name">
                        <Button
                          size="small"
                          onClick={copyIndexName}
                          startIcon={
                            copied ? <CheckIcon /> : <ContentCopyIcon />
                          }
                        >
                          Copy
                        </Button>
                      </Tooltip>
                      <Button
                        color="inherit"
                        size="small"
                        onClick={handleReset}
                        startIcon={<RefreshIcon />}
                      >
                        New Process
                      </Button>
                    </Stack>
                  }
                >
                  <Typography variant="body2">
                    Index built successfully! Your index name is:{" "}
                    <strong>{indexName}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Switch to the Search tab to start searching your indexed
                    content
                  </Typography>
                </Alert>
              )}
            </Stack>

            {/* Network Visualization */}
            {webpageGraph && parentQueuedLogs.length === 1 && (
              <Card variant="outlined" sx={{ mt: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Website Structure Visualization
                  </Typography>
                  <WebpageNetwork data={webpageGraph} />
                </CardContent>
              </Card>
            )}

            {/* Log Viewer */}
            <Card variant="outlined" sx={{ mt: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Process Logs
                </Typography>
                <LogViewer
                  taskId={url}
                  onQueuedLogsChange={handleQueuedLogsChange}
                />
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Recent Jobs Section */}
        <Box>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" gutterBottom>
            Recent Jobs
          </Typography>
          {recentJobs.length > 0 ? (
            <Stack spacing={2}>
              {recentJobs.map((job, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  sx={{
                    "&:hover": {
                      boxShadow: theme.shadows[2],
                      transition: "box-shadow 0.2s",
                    },
                  }}
                >
                  <CardContent>
                    <Stack spacing={1}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="subtitle1" component="div">
                          {job.indexName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(job.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {job.url}
                      </Typography>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Chip
                          label={job.status}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleLoadRecentJob(job)}
                        >
                          Load Configuration
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">
              No recent jobs found. Start by creating a new index above.
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

export default UnifiedScrapeAndIndex;
