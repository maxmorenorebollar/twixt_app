import { Button } from "@mui/material";
import { useState } from "react";
const CreateGame = () => {
  const [link, setLink] = useState("");

  const handleCreateGameClick = function (e: MouseEvent<HTMLButtonElement>) {};
  return (
    <div>
      <Button variant="contained">Create Game</Button>
      <p>{link}</p>
    </div>
  );
};

export default CreateGame;
