
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ZodiacProfile, GameCharacter } from "@/types/zodiac";
import { createZodiacProfile, getPrimaryAbility, getSecondaryAbility, getCompanionType, generateCharacterStats } from "@/utils/zodiacUtils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CharacterCreationProps {
  profile: ZodiacProfile;
  characterName: string;
  onComplete: (character: GameCharacter) => void;
}

export default function CharacterCreation({ profile, characterName, onComplete }: CharacterCreationProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReturnType<typeof generateCharacterStats> | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Generate character stats based on profile
    if (profile) {
      const generatedStats = generateCharacterStats(profile);
      setStats(generatedStats);
      setLoading(false);
    }
  }, [profile]);
  
  const handleCreateCharacter = () => {
    if (!stats) return;
    
    const character: GameCharacter = {
      profile,
      name: characterName,
      level: 1,
      ...stats,
      primaryAbility: getPrimaryAbility(profile.westernSign),
      secondaryAbility: getSecondaryAbility(profile.chineseSign),
      companionType: getCompanionType(profile.chineseSign)
    };
    
    toast({
      title: "Character Created",
      description: `${character.name}, the ${profile.westernSign} hero has begun their mythical journey!`,
    });
    
    // Save to localStorage
    localStorage.setItem('olympusCharacter', JSON.stringify(character));
    
    // Complete character creation
    onComplete(character);
  };
  
  if (loading) {
    return (
      <Card className="w-full max-w-lg olympus-card animate-fade-in">
        <CardHeader>
          <CardTitle className="text-center">Consulting the Fates...</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-lg olympus-card animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{characterName}</CardTitle>
        <CardDescription className="text-center">
          {profile.westernSign} • {profile.chineseSign} • {profile.element}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="abilities" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="abilities">Abilities</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="companion">Companion</TabsTrigger>
          </TabsList>
          
          <TabsContent value="abilities" className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-md">
              <h3 className="font-serif text-lg font-medium">Primary: {getPrimaryAbility(profile.westernSign)}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your Western zodiac grants you mastery over the element of {profile.element}.
              </p>
            </div>
            
            <div className="bg-secondary/10 p-4 rounded-md">
              <h3 className="font-serif text-lg font-medium">Secondary: {getSecondaryAbility(profile.chineseSign)}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your Chinese zodiac sign of {profile.chineseSign} bestows unique abilities.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            {stats && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-olympus-azure/20 p-4 rounded-md">
                  <h3 className="font-serif text-lg font-medium">Health</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(stats.health/150)*100}%` }}></div>
                  </div>
                  <p className="text-right text-sm mt-1">{stats.health}</p>
                </div>
                
                <div className="bg-olympus-azure/20 p-4 rounded-md">
                  <h3 className="font-serif text-lg font-medium">Mana</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(stats.mana/150)*100}%` }}></div>
                  </div>
                  <p className="text-right text-sm mt-1">{stats.mana}</p>
                </div>
                
                <div className="bg-olympus-azure/20 p-4 rounded-md">
                  <h3 className="font-serif text-lg font-medium">Strength</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(stats.strength/20)*100}%` }}></div>
                  </div>
                  <p className="text-right text-sm mt-1">{stats.strength}</p>
                </div>
                
                <div className="bg-olympus-azure/20 p-4 rounded-md">
                  <h3 className="font-serif text-lg font-medium">Agility</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${(stats.agility/20)*100}%` }}></div>
                  </div>
                  <p className="text-right text-sm mt-1">{stats.agility}</p>
                </div>
                
                <div className="bg-olympus-azure/20 p-4 rounded-md">
                  <h3 className="font-serif text-lg font-medium">Wisdom</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${(stats.wisdom/20)*100}%` }}></div>
                  </div>
                  <p className="text-right text-sm mt-1">{stats.wisdom}</p>
                </div>
                
                <div className="bg-olympus-azure/20 p-4 rounded-md">
                  <h3 className="font-serif text-lg font-medium">Charisma</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: `${(stats.charisma/20)*100}%` }}></div>
                  </div>
                  <p className="text-right text-sm mt-1">{stats.charisma}</p>
                </div>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground text-center">
              Your numerology value of {profile.numerology} influences your destiny.
            </p>
          </TabsContent>
          
          <TabsContent value="companion" className="space-y-4">
            <div className="bg-olympus-gold/10 p-6 rounded-md flex flex-col items-center">
              <h3 className="font-serif text-xl font-medium mb-2">{getCompanionType(profile.chineseSign)}</h3>
              <div className="w-24 h-24 bg-olympus-gold/20 rounded-full flex items-center justify-center mb-3">
                <div className="w-16 h-16 bg-olympus-gold/40 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-3xl">{profile.chineseSign === "Dragon" ? "🐉" : profile.chineseSign === "Tiger" ? "🐯" : "✨"}</span>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Your Chinese zodiac sign of {profile.chineseSign} grants you a loyal companion on your journey through the mythical realms.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCreateCharacter} 
          className="w-full olympus-button"
        >
          Begin Your Odyssey
        </Button>
      </CardFooter>
    </Card>
  );
}
