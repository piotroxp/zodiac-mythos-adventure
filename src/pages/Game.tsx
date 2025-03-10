
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GameContainer from "@/components/GameContainer";

const Game = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if profile exists in localStorage
    const profile = localStorage.getItem('olympusProfile');
    
    if (!profile) {
      // If no profile exists, redirect to index to create one
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="h-screen w-full">
      <GameContainer />
    </div>
  );
};

export default Game;
