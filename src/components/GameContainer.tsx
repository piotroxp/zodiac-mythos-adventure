import { useState, useEffect } from "react";
import { ZodiacProfile, GameCharacter, GameState } from "@/types/zodiac";
import CharacterCreation from "./CharacterCreation";
import ThreeScene from "./ThreeScene";
import ConversationPanel from "./ConversationPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { createZodiacProfile } from "@/utils/zodiacUtils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function GameContainer() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ZodiacProfile | null>(null);
  const [characterName, setCharacterName] = useState<string>("");
  const [character, setCharacter] = useState<GameCharacter | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentLocation: "Mount Olympus",
    questProgress: {},
    dayNightCycle: "day",
    gameTime: 0
  });
  const [showUI, setShowUI] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const profileData = localStorage.getItem('olympusProfile');
    const storedName = localStorage.getItem('olympusCharacterName');
    const characterData = localStorage.getItem('olympusCharacter');
    
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        const profile = {
          ...parsed,
          birthDate: new Date(parsed.birthDate)
        };
        setProfile(profile);
        
        if (storedName) {
          setCharacterName(storedName);
        }
        
        if (characterData) {
          const parsedCharacter = JSON.parse(characterData);
          setCharacter({
            ...parsedCharacter,
            profile: {
              ...parsedCharacter.profile,
              birthDate: new Date(parsedCharacter.profile.birthDate)
            }
          });
        }
      } catch (e) {
        console.error("Error parsing profile data", e);
        const defaultProfile = createZodiacProfile(new Date());
        setProfile(defaultProfile);
      }
    }
    
    setLoading(false);
    
    const interval = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.gameTime + 1;
        let newCycle = prev.dayNightCycle;
        
        if (newTime % 60 === 0) {
          switch(prev.dayNightCycle) {
            case "dawn": newCycle = "day"; break;
            case "day": newCycle = "dusk"; break;
            case "dusk": newCycle = "night"; break;
            case "night": newCycle = "dawn"; break;
          }
          
          toast({
            title: `${newCycle.charAt(0).toUpperCase() + newCycle.slice(1)} has arrived`,
            description: getTimeDescription(newCycle),
          });
        }
        
        return {
          ...prev,
          gameTime: newTime,
          dayNightCycle: newCycle
        };
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleCharacterCreated = (newCharacter: GameCharacter) => {
    setCharacter(newCharacter);
  };
  
  const handleToggleUI = () => {
    setShowUI(!showUI);
  };
  
  const handleGodInteraction = (godName: string | null) => {
    if (godName !== activeConversation) {
      if (godName) {
        if (!activeConversation) {
          toast({
            title: `${godName} wishes to speak with you`,
            description: "Press E to engage in conversation",
          });
        }
      }
      
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'e' || e.key === 'E') {
          if (godName) {
            setActiveConversation(godName);
          }
          window.removeEventListener('keydown', handleKeyPress);
        }
      };
      
      if (godName) {
        window.addEventListener('keydown', handleKeyPress);
        
        const timeout = setTimeout(() => {
          window.removeEventListener('keydown', handleKeyPress);
        }, 3000);
        
        return () => {
          clearTimeout(timeout);
          window.removeEventListener('keydown', handleKeyPress);
        };
      }
    }
  };
  
  const handleEndConversation = () => {
    setActiveConversation(null);
  };
  
  const getTimeDescription = (cycle: "dawn" | "day" | "dusk" | "night") => {
    switch(cycle) {
      case "dawn": return "The first light of Apollo's chariot appears on the horizon.";
      case "day": return "The sun shines brightly over the celestial realms.";
      case "dusk": return "Apollo's journey nears its end as shadows lengthen.";
      case "night": return "Nyx's cloak covers the heavens as stars illuminate the sky.";
    }
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-olympus flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif mb-4">Connecting to Olympus</h1>
          <div className="w-16 h-16 mx-auto border-4 border-olympus-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 flex flex-col">
      {profile && (
        <ThreeScene 
          profile={profile} 
          gameState={gameState}
          onGodInteraction={handleGodInteraction}
        />
      )}
      
      <div className={`absolute transition-opacity duration-300 ${showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          <div className="olympus-card p-2 px-4">
            <Badge variant="secondary" className="font-medium">
              {gameState.currentLocation}
            </Badge>
          </div>
          
          <div className="olympus-card p-2 px-4">
            <Badge variant="outline" className="font-medium capitalize">
              {gameState.dayNightCycle}
            </Badge>
          </div>
        </div>
        
        {character && (
          <div className="absolute top-16 left-4 olympus-card p-4 max-w-[240px]">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-olympus-gold/20 rounded-full flex items-center justify-center mr-3">
                <span className="font-serif text-lg">{character.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-serif text-lg leading-tight">{character.name}</h3>
                <div className="flex items-center">
                  <Badge variant="secondary" className="text-xs mr-1">Lvl {character.level}</Badge>
                  <span className="text-xs text-muted-foreground">{character.profile.westernSign}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mt-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Health</span>
                  <span>{character.health}/100</span>
                </div>
                <Progress value={character.health} className={cn("h-2", "bg-secondary")} />
                <div className="h-2 -mt-2 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${character.health}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Mana</span>
                  <span>{character.mana}/100</span>
                </div>
                <Progress value={character.mana} className={cn("h-2", "bg-secondary")} />
                <div className="h-2 -mt-2 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${character.mana}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-border">
              <h4 className="text-sm font-medium mb-2">Abilities</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-auto py-1 text-xs justify-start">
                  {character.primaryAbility}
                </Button>
                <Button variant="outline" size="sm" className="h-auto py-1 text-xs justify-start">
                  {character.secondaryAbility}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {activeConversation && character && (
        <ConversationPanel 
          godName={activeConversation}
          onClose={handleEndConversation}
        />
      )}
      
      {!activeConversation && showUI && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2">
          {character && nearbyGod && (
            <div className="olympus-card p-2 px-4 text-center animate-pulse">
              <p className="text-sm">Press <kbd className="px-2 py-1 bg-muted rounded">E</kbd> to talk</p>
            </div>
          )}
        </div>
      )}
      
      <Button 
        onClick={handleToggleUI}
        className="absolute bottom-4 right-4 rounded-full w-10 h-10 p-0"
        variant="outline"
      >
        {showUI ? "UI" : "UI"}
      </Button>
      
      {profile && !character && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-10">
          <CharacterCreation 
            profile={profile}
            characterName={characterName}
            onComplete={handleCharacterCreated}
          />
        </div>
      )}
      
      {character && !activeConversation && (
        <div className="fixed bottom-4 left-4 olympus-card p-4 max-w-[300px] animate-fade-in">
          <h3 className="font-serif text-lg mb-1">Welcome to Olympus</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Your journey begins at the peak of Mount Olympus. Explore the realm and discover your destiny.
          </p>
          <Button className="w-full">Begin Quest</Button>
        </div>
      )}
    </div>
  );
}
