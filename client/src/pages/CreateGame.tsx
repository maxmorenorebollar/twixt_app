import { Button } from "@mui/material";
import { useState } from "react";
import type { MouseEvent } from "react";

const CreateGame = () => {
  const [link, setLink] = useState("");

  const handleCreateGameClick = async function (
    e: MouseEvent<HTMLButtonElement>
  ) {
    const response = await fetch("http://localhost:3000/creategame", {
      method: "POST",
    });
    if (!response.ok) {
      console.log("error some where");
    } else {
      const gameId = await response.json();
      setLink(`http://localhost:5173/game/${gameId}`);
      console.log(gameId);
    }
  };
  return (
    <div>
      <Button variant="contained" onClick={handleCreateGameClick}>
        Create Game
      </Button>
      <p>{link}</p>
    </div>
  );
};

export default CreateGame;
