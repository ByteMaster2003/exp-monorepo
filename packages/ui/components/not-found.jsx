import { WarningAmberRounded as WarningIcon } from "@mui/icons-material";
import { Typography, Box } from "@mui/material";

export const NotFound = () => {
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
      <WarningIcon sx={{ fontSize: 40, color: "oklch(76.9% 0.188 70.08)" }} />
      <Typography variant="h4" className="text-gray-800 dark:text-gray-400">
        Not Found!
      </Typography>

      <Typography variant="body1" className="text-gray-600 dark:text-gray-400">
        The page you are looking for doesn't exists
      </Typography>
    </Box>
  );
};
