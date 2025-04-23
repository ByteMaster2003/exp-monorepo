import { zodResolver } from "@hookform/resolvers/zod";
import { Google as GoogleIcon, GitHub as GitHubIcon } from "@mui/icons-material";
import { Box, Paper, Button, TextField, Divider, Typography } from "@mui/material";
import { nanoid } from "nanoid";
import { useSnackbar } from "notistack";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { validatePayloadWithSchema } from "ui";
import { BadRequest } from "ui/components";
import { POST } from "ui/utils";

import { loginSchema, registerSchema, validateQuery } from "../validations/auth.validation.js";

export const Home = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isError, setIsError] = useState("");
  const [query, setQuery] = useState({
    state: "",
    app: ""
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    mode: "all",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });
  const config = import.meta.env;
  const clientCallback = {
    "control-deck": `${config.VITE_CONTROL_DECK_BASE}/oauth/callback`,
    restify: `${config.VITE_RESTIFY_BASE}/oauth/callback`
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const formState = nanoid();
    const payload = {
      app: query.app,
      state: formState,
      email: data.email,
      password: data.password
    };
    if (!isLogin) payload.name = data.name;
    const url = `${import.meta.env.VITE_BASE_URL}/auth/sign-${isLogin ? "in" : "up"}`;

    const response = await POST(url, payload);
    if (!response.success) {
      enqueueSnackbar(response.message, { variant: "error" });
    } else if (response?.state === formState) {
      window.location.href = `${clientCallback[response.app]}?code=${response.code}&state=${query.state}`;
    } else {
      return enqueueSnackbar("Invalid session!", { variant: "error" });
    }
    setIsSubmitting(false);
  };

  const toggleLoginForm = () => {
    reset();
    setIsLogin((prev) => (prev ? false : true));
  };

  const inputs = [
    {
      name: "email",
      type: "email",
      label: "Email"
    },
    {
      name: "password",
      type: "password",
      label: "Password"
    }
  ];
  if (!isLogin) {
    inputs.unshift({
      name: "name",
      type: "text",
      label: "Fullname"
    });
    inputs.push({ name: "confirmPassword", type: "password", label: "Confirm Password" });
  }

  const apps = {
    "control-deck": "Control Deck",
    restify: "Restify"
  };

  const authorizeGoogle = async () => {
    window.location.href = `${baseUrl}/oauth/google/authorize?app=${query.app}&state=${query.state}`;
  };

  const authorizeGitHub = async () => {
    window.location.href = `${baseUrl}/oauth/github/authorize?app=${query.app}&state=${query.state}`;
  };

  useEffect(() => {
    // Check if there is any error message
    const errorMessage = searchParams.get("error");
    if (errorMessage) return setIsError(errorMessage);

    // Validate requird queries
    const queryParams = { app: searchParams.get("app"), state: searchParams.get("state") };
    const { data, error } = validatePayloadWithSchema(validateQuery, queryParams);
    if (error) return setIsError(error);

    setQuery(data);
  }, [searchParams]);

  // Display error component if there is any error
  if (isError) {
    return <BadRequest message={isError}></BadRequest>;
  }
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        alignItems: "center",
        paddingTop: "4rem"
      }}
    >
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: { xs: "2rem", md: "2rem 4rem" },
          borderRadius: "0.5rem",
          width: { xs: "90%", sm: "80%", md: "40rem" },
          maxWidth: "40rem"
        }}
        elevation={3}
        component={"form"}
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Header */}
        <Typography variant="h5" sx={{ fontWeight: 900, marginBottom: "1rem" }}>
          {isLogin ? "Sign in to" : "Sign up to"} {apps[query.app]}
        </Typography>

        {/* List OAuth providers */}
        <Button
          component="label"
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={{ textTransform: "none", fontWeight: 600 }}
          onClick={authorizeGoogle}
        >
          Continue with Google
        </Button>
        <Button
          component="label"
          variant="outlined"
          startIcon={<GitHubIcon />}
          sx={{ textTransform: "none", fontWeight: 600 }}
          onClick={authorizeGitHub}
        >
          Continue with GitHub
        </Button>

        {/* Divider */}
        <Divider
          component="div"
          role="presentation"
          sx={{ margin: "0.5rem 0", fontWeight: "light", marginBottom: "2rem", fontSize: "small" }}
        >
          or {isLogin ? "sign in" : "sign up"} with email
        </Divider>

        {/* Input fields */}
        {inputs.map((data) => (
          <Controller
            key={data.name}
            name={data.name}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type={data.type}
                label={data.label}
                variant="outlined"
                sx={{ maxWidth: "100%" }}
                size="small"
                error={errors[data.name]}
                helperText={errors[data.name]?.message}
              />
            )}
          />
        ))}

        {/* Submit button */}
        <Button
          loading={isSubmitting}
          type="submit"
          className="w-full"
          variant="contained"
          sx={{ textTransform: "none" }}
        >
          {isLogin ? "Sign In" : "Sign Up"}
        </Button>

        {/* Toggle SignUp/SignIn */}
        <Typography varient="body2" sx={{ fontWeight: "light", fontSize: "small" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <a
            type="button"
            onClick={toggleLoginForm}
            className="underline cursor-pointer dark:text-gray-400 dark:hover:text-gray-200 text-gray-800 hover:text-gray-600"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </a>
        </Typography>
      </Paper>
    </Box>
  );
};
