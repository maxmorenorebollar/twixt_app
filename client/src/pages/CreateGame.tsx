import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router";
import "../styles/ui.css";

const CreateGame = () => {
  const [link, setLink] = useState("");

  const handleCreateGameClick = async (_e: MouseEvent<HTMLButtonElement>) => {
    const response = await fetch("/creategame", {
      method: "POST",
    });
    if (!response.ok) {
      console.log("Error on server side");
    } else {
      const gameId = await response.json();
      setLink(`game/${gameId}`);
    }
  };

  const handleCopyGameLink = async (_e: MouseEvent<HTMLButtonElement>) => {
    try {
      await navigator.clipboard.writeText(
        `https://twixt-app.onrender.com/${link}`
      );
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
    }
  };

  return (
    <Container maxWidth="lg" className="auth-page">
      <Stack spacing={3} alignItems="center">
        <Stack spacing={0.5} className="auth-hero" textAlign="center">
          <Typography
            className="auth-kicker"
            variant="overline"
            fontWeight={700}
          >
            New match
          </Typography>
          <Typography variant="h4" fontWeight={800} color="primary.light">
            Create a new game
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate a shareable link, then open it or copy to invite.
          </Typography>
        </Stack>

        <Box flex={1} minWidth={0} maxWidth={520} width="100%">
          <Paper elevation={8} className="app-card">
            <Stack spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={handleCreateGameClick}
              >
                Create Game
              </Button>

              {link && (
                <Stack
                  spacing={1.5}
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  sx={{ flexWrap: { sm: "wrap" } }}
                >
                  <Chip
                    label={`https://twixt-app.onrender.com/${link}`}
                    sx={{
                      bgcolor: "common.white",
                      color: "common.black",
                      px: 1,
                      flex: 1,
                      minWidth: 0,
                      maxWidth: "100%",
                      "& .MuiChip-label": {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    }}
                    variant="filled"
                  />
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      flex: 1,
                      justifyContent: { xs: "center", sm: "flex-end" },
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to={`/${link}`}
                    >
                      Open
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleCopyGameLink}
                    >
                      Copy
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Container>
  );
};

export default CreateGame;
