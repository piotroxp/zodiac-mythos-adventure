
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createZodiacProfile, getZodiacDescription } from "@/utils/zodiacUtils";
import { useToast } from "@/hooks/use-toast";

export default function ZodiacForm() {
  const [birthDate, setBirthDate] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!birthDate) {
      toast({
        title: "Birth date required",
        description: "Please enter your birth date to continue",
        variant: "destructive",
      });
      return;
    }
    
    if (!name) {
      toast({
        title: "Name required",
        description: "Please enter your hero's name to continue",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const profile = createZodiacProfile(new Date(birthDate));
      const description = getZodiacDescription(profile);
      
      // Store in localStorage for game to access
      localStorage.setItem('olympusProfile', JSON.stringify(profile));
      localStorage.setItem('olympusCharacterName', name);
      
      toast({
        title: "Profile Created!",
        description: `Welcome, ${name}. ${description}`,
      });
      
      // Add a slight delay for the animation
      setTimeout(() => {
        navigate('/game');
      }, 800);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem creating your profile. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md olympus-card animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Begin Your Mythical Journey</CardTitle>
        <CardDescription className="text-center">
          Enter your birth date to discover your zodiac destiny
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Hero Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your hero's name"
              className="olympus-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthdate">Birth Date</Label>
            <Input
              id="birthdate"
              type="date"
              className="olympus-input"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full olympus-button"
            disabled={loading}
          >
            {loading ? "Consulting the Stars..." : "Begin Journey"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Your destiny is written in the stars
      </CardFooter>
    </Card>
  );
}
