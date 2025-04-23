import { Error as ErrorIcon } from "@mui/icons-material";
import { Typography, Box, List, ListItem, ListItemText } from "@mui/material";

export const BadRequest = ({ message }) => {
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
        Bad Request!
      </Typography>

      {Array.isArray(message) ? (
        <List>
          {message?.map((err) => (
            <ListItem key={err.field} dense>
              <ListItemText primary={`${err.field}: ${err.message}`} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" className="text-gray-600 dark:text-gray-400">
          {message}
        </Typography>
      )}
    </Box>
  );
};
