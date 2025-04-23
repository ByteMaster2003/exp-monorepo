import { Error as ErrorIcon } from "@mui/icons-material";
import { Typography, Box } from "@mui/material";

export const BadRequest = () => {
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
      <ErrorIcon sx={{ fontSize: 40, color: "oklch(76.9% 0.188 70.08)" }} />
      <Typography variant="h4" className="text-gray-800 dark:text-gray-400">
        Please Wait...
      </Typography>
    </Box>
  );
};
