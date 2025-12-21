import { Container, Paper, Stack, Typography } from "@mui/material";
import Board from "./components/Board.js";
import "./styles/ui.css";

const App = () => {
  return (
    <Container maxWidth="lg" className="app-container">
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="h4" fontWeight={800} color="primary.light">
            Twixt Playground
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Modern, fun duel. Blue connects top↕bottom, Red connects left↔right.
          </Typography>
        </Stack>

        <Paper elevation={8} className="app-card">
          <Board />
        </Paper>
      </Stack>
    </Container>
  );
};

export default App;
