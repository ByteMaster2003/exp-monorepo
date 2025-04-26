/* eslint-disable react-hooks/exhaustive-deps */
import {
  CheckCircleRounded as CheckCircleRoundedIcon,
  ErrorRounded as ErrorRoundedIcon,
  KeyboardDoubleArrowUp as RefreshIcon,
  ArrowDownward as ArrowDownIcon
} from "@mui/icons-material";
import {
  Box,
  Container,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Tooltip,
  Paper,
  Typography,
  IconButton,
  Drawer,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "ui/hooks";
import { GET } from "ui/utils";

import loader from "../assets/loader.svg";
import { NavigationBar } from "../components/navbar.jsx";
import { AppConfig } from "../config.js";
import { flattenObjectToKeyValuePairs } from "../utils/object.util.js";
import { socket } from "../utils/socket.util.js";

export const Logs = () => {
  const { mode } = useTheme();
  const [page, setPage] = useState(1);
  const [project, setProject] = useState("");

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [logs, setLogs] = useState([]);
  const [newLogs, setNewLogs] = useState([]);
  const [logData, setLogData] = useState(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(true);
  const lastFetch = new Date().toISOString();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
    setShowScrollButton(false);
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isUserAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
      setIsAtBottom(isUserAtBottom);

      if (!isAtBottom) {
        setShowScrollButton(true);
      }
    }
  };

  const fetchLogs = (limit = 50, isProjectChanged = false) => {
    if (project) {
      setIsLoading(true);
      const queries = new URLSearchParams({ project, limit, page: page, timestamp: lastFetch });

      GET(`${AppConfig.SERVERS.LOG_STREAMR}/v1/logs?${queries.toString()}`)
        .then((response) => {
          if (response.success) {
            if (isProjectChanged) {
              setPage(1);
              setLogs(response.data.results);
            } else {
              setLogs((prev) => [...response.data.results, ...prev]);
              setPage((prev) => prev + 1);
            }
          }
        })
        .catch()
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleChange = (event) => {
    setProject(event.target.value);
    // setNewLogs([]);
    fetchLogs(50);
  };

  const connectToLogServer = () => {
    if (!isConnected && !isConnecting) {
      setIsConnecting(true);
      socket.connect();
    }
  };

  const handleLogClick = (log) => {
    const data = {
      project: log.project,
      level: log.level,
      timestamp: log.timestamp,
      logType: log.logType,
      message: log.message
    };
    if (log.query) data.query = JSON.parse(log.query);
    if (log.params) data.params = JSON.parse(log.params);
    if (log.body) data.body = JSON.parse(log.body);
    if (log.data) data.data = JSON.parse(log.data);
    if (log.metadata) data.metadata = JSON.parse(log.metadata);
    if (log.stack) data.stack = log.stack;

    setLogData(flattenObjectToKeyValuePairs(data));
    setIsOpen(true);
  };

  const handleNewLog = (log) => {
    if (project === log.project) {
      setNewLogs((prev) => [...prev, log]);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnecting(false);
      setIsConnected(socket.connected);

      // Listen for any new logs
      socket.on("new-log", handleNewLog);
    });
    socket.on("disconnect", () => setIsConnected(socket.connected));
    socket.on("close", () => setIsConnected(socket.connected));
    socket.io.on("reconnect", () => setIsConnecting(true));
    socket.io.on("reconnect_attempt", () => setIsConnecting(true));
    socket.io.on("reconnect_error", () => setIsConnecting(false));
    socket.io.on("reconnect_failed", () => setIsConnecting(false));

    setIsConnecting(true);
    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("close");

      socket.io.off("reconnect");
      socket.io.off("reconnect_attempt");
      socket.io.off("reconnect_error");
      socket.io.off("reconnect_failed");
      socket.close();
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchLogs(50, true);
  }, [project]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [newLogs]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Navigation Bar */}
      <NavigationBar />

      {/* Container For Logs */}
      <Container maxWidth="xl" sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        {/* Project selection and status bar */}
        <Box sx={{ my: "1rem", display: "flex", gap: "1rem" }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="select-project">Project</InputLabel>
            <Select
              labelId="select-project"
              label="Project"
              value={project}
              onChange={handleChange}
            >
              <MenuItem value="">None</MenuItem>
              {AppConfig.PROJECTS.map((value) => (
                <MenuItem value={value} sx={{ textTransform: "capitalize" }}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title={isConnected ? "Connected to Log Server" : "Try Reconnecting"}>
            <Button
              loading={isConnecting}
              loadingPosition="start"
              startIcon={isConnected ? <CheckCircleRoundedIcon /> : <ErrorRoundedIcon />}
              variant="outlined"
              color={isConnecting ? "info" : isConnected ? "success" : "error"}
              sx={{ textTransform: "capitalize" }}
              onClick={connectToLogServer}
            >
              {isConnecting
                ? "Connecting To Server"
                : isConnected
                  ? "Connected"
                  : "Server not Connected"}
            </Button>
          </Tooltip>
        </Box>

        {/* Logs streaming */}
        <Box sx={{ flexGrow: 1, maxHeight: "87vh", paddingBottom: "2rem" }}>
          <Paper
            component={"div"}
            onScroll={handleScroll}
            elevation={3}
            className="h-full flex flex-col overflow-y-auto relative"
          >
            {/* Load previous logs button */}
            <Box sx={{ display: "flex", justifyContent: "center", paddingTop: "0.5rem" }}>
              <Tooltip title="Get Previous Logs">
                <IconButton loading={isLoading} color="primary" size="large" onClick={fetchLogs}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Display Logs */}
            {[...logs, ...newLogs].map((log, index) => (
              <Box
                key={index}
                component="button"
                sx={{
                  paddingLeft: "1rem",
                  paddingY: "0.2rem",
                  paddingRight: "2rem"
                }}
                className="flex gap-2 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700"
                onClick={() => handleLogClick(log)}
              >
                <Typography
                  color="secondary"
                  fontFamily="monospace"
                  noWrap
                  minWidth={230}
                  textAlign={"left"}
                >
                  {log.timestamp}
                </Typography>
                <Typography color={log.level === "error" ? "error" : "info"} fontFamily="monospace">
                  {log.level}
                </Typography>
                <Typography fontFamily="monospace" align="left">
                  {JSON.stringify({
                    message: log.message,
                    data: log.data,
                    metadata: log.metadata,
                    query: log.query,
                    params: log.params,
                    body: log.body,
                    stack: log.stack
                  })}
                </Typography>
              </Box>
            ))}

            {/* Bottom reference for auto scroll */}
            <Box
              component="div"
              ref={messagesEndRef}
              sx={{
                paddingY: "2rem",
                display: "flex",
                justifyContent: "center"
              }}
            >
              {project && isConnected && (
                <Box
                  component="img"
                  sx={{
                    height: { xs: "3rem", sm: "5rem" }
                  }}
                  src={loader}
                  alt="loading.."
                />
              )}
            </Box>

            {/* Scroll to bottom button  */}
            {showScrollButton && (
              <Box
                sx={{
                  position: "fixed",
                  paddingTop: "0.5rem",
                  left: "50%",
                  translate: "-50% 0",
                  bottom: "3rem"
                }}
              >
                <Tooltip title="Scroll to bottom">
                  <IconButton loading={isLoading} color="primary" size="large" onClick={fetchLogs}>
                    <ArrowDownIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>

      {/* Details view of logs in drawer */}
      <Drawer elevation={1} anchor="right" open={isOpen} onClose={() => setIsOpen(false)}>
        <TableContainer component={Paper} sx={{ minWidth: 800 }}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 900,
                    fontFamily: "monospace",
                    backgroundColor: (theme) =>
                      mode === "dark" ? theme.palette.common.black : theme.palette.common.white
                  }}
                >
                  Key
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 900,
                    fontFamily: "monospace",
                    backgroundColor: (theme) =>
                      mode === "dark" ? theme.palette.common.black : theme.palette.common.white
                  }}
                >
                  Value
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logData &&
                logData.map((row) => (
                  <TableRow key={row[0]}>
                    <TableCell sx={{ fontFamily: "monospace" }}>{row[0]}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", maxWidth: 900 }}>{row[1]}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Drawer>
    </Box>
  );
};
