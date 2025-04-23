import { Box } from "@mui/material";

import loader from "../assets/bouncing-circles.svg";

export const LoaderComponent = () => {
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
      <Box
        component="img"
        sx={{
          height: { xs: "7rem", sm: "10rem" }
        }}
        src={loader}
        alt="loading.."
      />
    </Box>
  );
};
