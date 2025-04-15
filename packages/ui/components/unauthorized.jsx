import { ErrorOutlineRounded as ErrorIcon } from "@mui/icons-material";
import { Typography, Box } from "@mui/material";

export const Unauthorized = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        alignItems: "center",
        paddingTop: "10rem"
      }}
    >
      <ErrorIcon sx={{ fontSize: 40, color: "brown" }} />
      <Typography variant="h4" className="text-gray-800 dark:text-gray-400">
        Access Denied!
      </Typography>

      <Typography variant="body1" className="text-gray-600 dark:text-gray-400">
        You do not have permission to view this page. Please contact your administrator or return to
        a page you have access to.
      </Typography>
    </Box>
  );
};
