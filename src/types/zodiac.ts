
export type WesternZodiacSign = 
  | "Aries" 
  | "Taurus" 
  | "Gemini" 
  | "Cancer" 
  | "Leo" 
  | "Virgo" 
  | "Libra" 
  | "Scorpio" 
  | "Sagittarius" 
  | "Capricorn" 
  | "Aquarius" 
  | "Pisces";

export type ChineseZodiacSign = 
  | "Rat" 
  | "Ox" 
  | "Tiger" 
  | "Rabbit" 
  | "Dragon" 
  | "Snake" 
  | "Horse" 
  | "Goat" 
  | "Monkey" 
  | "Rooster" 
  | "Dog" 
  | "Pig";

export type Element = "Fire" | "Earth" | "Air" | "Water";

export interface ZodiacProfile {
  westernSign: WesternZodiacSign;
  chineseSign: ChineseZodiacSign;
  element: Element;
  birthDate: Date;
  numerology: number;
}

export interface GameCharacter {
  profile: ZodiacProfile;
  name: string;
  level: number;
  health: number;
  mana: number;
  strength: number;
  agility: number;
  wisdom: number;
  charisma: number;
  primaryAbility: string;
  secondaryAbility: string;
  companionType: string;
}

export interface GameState {
  character?: GameCharacter;
  currentLocation: string;
  questProgress: Record<string, number>;
  dayNightCycle: "dawn" | "day" | "dusk" | "night";
  gameTime: number;
}
