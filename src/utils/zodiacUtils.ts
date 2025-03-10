
import { WesternZodiacSign, ChineseZodiacSign, Element, ZodiacProfile } from "@/types/zodiac";

export function calculateWesternZodiac(date: Date): WesternZodiacSign {
  const month = date.getMonth() + 1; // getMonth() is 0-indexed
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

export function calculateChineseZodiac(date: Date): ChineseZodiacSign {
  const year = date.getFullYear();
  const zodiacYear = (year - 4) % 12;

  switch (zodiacYear) {
    case 0: return "Rat";
    case 1: return "Ox";
    case 2: return "Tiger";
    case 3: return "Rabbit";
    case 4: return "Dragon";
    case 5: return "Snake";
    case 6: return "Horse";
    case 7: return "Goat";
    case 8: return "Monkey";
    case 9: return "Rooster";
    case 10: return "Dog";
    default: return "Pig";
  }
}

export function calculateElement(westernSign: WesternZodiacSign): Element {
  const fireSign = ["Aries", "Leo", "Sagittarius"];
  const earthSign = ["Taurus", "Virgo", "Capricorn"];
  const airSign = ["Gemini", "Libra", "Aquarius"];
  const waterSign = ["Cancer", "Scorpio", "Pisces"];

  if (fireSign.includes(westernSign)) return "Fire";
  if (earthSign.includes(westernSign)) return "Earth";
  if (airSign.includes(westernSign)) return "Air";
  return "Water";
}

export function calculateNumerology(date: Date): number {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  // Convert date to string and sum all digits
  const dateString = `${day}${month}${year}`;
  const sum = dateString.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  
  // If sum is greater than 9, reduce to a single digit
  if (sum > 9) {
    return sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  
  return sum;
}

export function createZodiacProfile(birthDate: Date): ZodiacProfile {
  const westernSign = calculateWesternZodiac(birthDate);
  const chineseSign = calculateChineseZodiac(birthDate);
  const element = calculateElement(westernSign);
  const numerology = calculateNumerology(birthDate);
  
  return {
    westernSign,
    chineseSign,
    element,
    birthDate,
    numerology
  };
}

export function getZodiacDescription(profile: ZodiacProfile): string {
  return `As a ${profile.westernSign} with the Chinese zodiac sign of ${profile.chineseSign}, you are aligned with the element of ${profile.element}. Your numerology value of ${profile.numerology} indicates ${getNumerologyMeaning(profile.numerology)}.`;
}

export function getPrimaryAbility(westernSign: WesternZodiacSign): string {
  const abilities: Record<WesternZodiacSign, string> = {
    "Aries": "Flame Strike",
    "Taurus": "Earth Shield",
    "Gemini": "Wind Clone",
    "Cancer": "Healing Tide",
    "Leo": "Solar Flare",
    "Virgo": "Nature's Blessing",
    "Libra": "Balance Beam",
    "Scorpio": "Venom Sting",
    "Sagittarius": "Celestial Arrow",
    "Capricorn": "Mountain Strength",
    "Aquarius": "Lightning Storm",
    "Pisces": "Ocean Surge"
  };

  return abilities[westernSign];
}

export function getSecondaryAbility(chineseSign: ChineseZodiacSign): string {
  const abilities: Record<ChineseZodiacSign, string> = {
    "Rat": "Shadow Stealth",
    "Ox": "Endurance Aura",
    "Tiger": "Ferocious Leap",
    "Rabbit": "Swift Dodge",
    "Dragon": "Ancient Breath",
    "Snake": "Hypnotic Gaze",
    "Horse": "Thundering Gallop",
    "Goat": "Mountain Climb",
    "Monkey": "Clever Trick",
    "Rooster": "Dawn's Call",
    "Dog": "Loyal Guard",
    "Pig": "Abundance Blessing"
  };

  return abilities[chineseSign];
}

export function getCompanionType(chineseSign: ChineseZodiacSign): string {
  const companions: Record<ChineseZodiacSign, string> = {
    "Rat": "Shadow Familiar",
    "Ox": "Stone Guardian",
    "Tiger": "Striped Warrior",
    "Rabbit": "Jade Hopper",
    "Dragon": "Miniature Drake",
    "Snake": "Coiled Whisperer",
    "Horse": "Swift Steed",
    "Goat": "Mountain Guide",
    "Monkey": "Trickster Spirit",
    "Rooster": "Sun Herald",
    "Dog": "Loyal Hound",
    "Pig": "Fortune Piglet"
  };

  return companions[chineseSign];
}

function getNumerologyMeaning(num: number): string {
  const meanings: Record<number, string> = {
    1: "leadership and independence",
    2: "harmony and cooperation",
    3: "creativity and expression",
    4: "stability and practicality",
    5: "freedom and adventure",
    6: "responsibility and nurturing",
    7: "analysis and understanding",
    8: "ambition and achievement",
    9: "compassion and idealism"
  };

  return meanings[num] || "mystical balance";
}

export function generateCharacterStats(profile: ZodiacProfile): {
  health: number;
  mana: number;
  strength: number;
  agility: number;
  wisdom: number;
  charisma: number;
} {
  const element = profile.element;
  const numerology = profile.numerology;
  
  // Base stats
  let stats = {
    health: 100,
    mana: 100,
    strength: 10,
    agility: 10,
    wisdom: 10,
    charisma: 10
  };
  
  // Element modifications
  switch (element) {
    case "Fire":
      stats.strength += 5;
      stats.agility += 3;
      stats.health -= 10;
      stats.mana += 15;
      break;
    case "Earth":
      stats.health += 20;
      stats.strength += 3;
      stats.agility -= 2;
      stats.wisdom += 2;
      break;
    case "Air":
      stats.agility += 5;
      stats.wisdom += 3;
      stats.mana += 10;
      stats.health -= 5;
      break;
    case "Water":
      stats.mana += 20;
      stats.wisdom += 5;
      stats.health += 5;
      stats.strength -= 2;
      break;
  }
  
  // Numerology influence
  stats.health += numerology * 2;
  stats.mana += numerology * 2;
  stats.strength += (numerology % 3 === 0) ? 3 : 0;
  stats.agility += (numerology % 3 === 1) ? 3 : 0;
  stats.wisdom += (numerology % 3 === 2) ? 3 : 0;
  stats.charisma += numerology;
  
  return stats;
}
