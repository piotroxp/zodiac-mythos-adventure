
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

interface ConversationPanelProps {
  godName: string;
  onClose: () => void;
}

interface DialogueLine {
  text: string;
  options?: DialogueOption[];
}

interface DialogueOption {
  text: string;
  nextLine: number;
}

export default function ConversationPanel({ godName, onClose }: ConversationPanelProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [dialogue, setDialogue] = useState<DialogueLine[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // Load dialogue based on which god the player is talking to
    setDialogue(getGodDialogue(godName));
    setCurrentLine(0);
    setDisplayedText('');
    setIsTyping(true);
  }, [godName]);

  useEffect(() => {
    if (currentLine < dialogue.length) {
      const fullText = dialogue[currentLine].text;
      let i = 0;
      setDisplayedText('');
      setIsTyping(true);

      const typingInterval = setInterval(() => {
        if (i < fullText.length) {
          setDisplayedText(prev => prev + fullText.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 30);

      return () => clearInterval(typingInterval);
    }
  }, [currentLine, dialogue]);

  const getGodDialogue = (god: string): DialogueLine[] => {
    switch (god) {
      case "Zeus":
        return [
          { 
            text: "Ah, mortal! You stand before Zeus, ruler of Olympus and the sky itself!",
            options: [
              { text: "It's an honor to meet you, Lord Zeus.", nextLine: 1 },
              { text: "What powers do you command?", nextLine: 2 }
            ]
          },
          { 
            text: "You show proper respect, unlike many who come to my mountain. Perhaps there is hope for you yet.",
            options: [
              { text: "I seek your wisdom.", nextLine: 3 },
              { text: "I should go now.", nextLine: 4 }
            ]
          },
          { 
            text: "I command the thunder, the lightning, and the order of the heavens. All gods and mortals answer to my will.",
            options: [
              { text: "Impressive! I'm honored to be in your presence.", nextLine: 3 },
              { text: "I should leave you to your divine duties.", nextLine: 4 }
            ]
          },
          { 
            text: "Seek your destiny with courage, mortal. The path of heroes is never easy, but glory awaits those who persevere.",
            options: [
              { text: "Thank you for your counsel.", nextLine: 4 }
            ]
          },
          { 
            text: "Go forth, and may the skies be clear for your journey... unless you displease me, of course.",
            options: [
              { text: "Farewell, Lord Zeus.", nextLine: 5 }
            ]
          },
          { text: "*Zeus returns to his contemplation of the mortal realm*" }
        ];
      case "Poseidon":
        return [
          { 
            text: "The seas send their greetings through me, Poseidon! What brings you to Olympus, land-dweller?",
            options: [
              { text: "I'm exploring Mount Olympus, Lord of the Seas.", nextLine: 1 },
              { text: "I've always been fascinated by the ocean.", nextLine: 2 }
            ]
          },
          { 
            text: "A curious mortal, wandering where few are permitted. Interesting...",
            options: [
              { text: "What brings you to the mountain instead of your ocean domain?", nextLine: 3 },
              { text: "I'll leave you to your business.", nextLine: 5 }
            ]
          },
          { 
            text: "My domain is vast and powerful, covering most of this world. The currents carry secrets even the gods have forgotten.",
            options: [
              { text: "Could you share some of those secrets?", nextLine: 4 },
              { text: "The ocean sounds fearsome.", nextLine: 3 }
            ]
          },
          { 
            text: "Family matters. Even gods must attend council. Zeus may rule the sky, but he knows better than to ignore the might of the sea.",
            options: [
              { text: "I understand. Family is important.", nextLine: 5 },
              { text: "I'll leave you to your divine affairs.", nextLine: 5 }
            ]
          },
          { 
            text: "Perhaps someday. If you prove worthy, seek me by the shore. There, we might speak more freely of the ocean's mysteries.",
            options: [
              { text: "I'll remember that, Lord Poseidon.", nextLine: 5 }
            ]
          },
          { text: "*Poseidon turns his attention back to his trident, which glimmers with the power of the seas*" }
        ];
      case "Athena":
        return [
          { 
            text: "Greetings, mortal. I am Athena, goddess of wisdom and strategic warfare. What knowledge do you seek today?",
            options: [
              { text: "I wish to learn from your wisdom, Lady Athena.", nextLine: 1 },
              { text: "How does one make wise decisions in difficult times?", nextLine: 2 }
            ]
          },
          { 
            text: "A commendable pursuit. Wisdom is not merely knowledge, but the application of it with forethought and clarity.",
            options: [
              { text: "Can you teach me strategy?", nextLine: 3 },
              { text: "What wisdom should I seek first?", nextLine: 2 }
            ]
          },
          { 
            text: "Consider all paths before choosing one. Weigh consequences, honor your principles, and remember that sometimes patience is the greatest strategy of all.",
            options: [
              { text: "That's profound advice.", nextLine: 4 },
              { text: "Is that how you approach problems?", nextLine: 3 }
            ]
          },
          { 
            text: "Strategy is learned through observation and experience. Watch the owl's patience, the spider's precision, and the way water finds its path around obstacles.",
            options: [
              { text: "I will try to be more observant.", nextLine: 4 },
              { text: "Thank you for this lesson.", nextLine: 4 }
            ]
          },
          { 
            text: "You show promise. Remember that true wisdom acknowledges its limitations. Return when you've reflected on our conversation.",
            options: [
              { text: "Farewell, Goddess of Wisdom.", nextLine: 5 }
            ]
          },
          { text: "*Athena returns to studying a scroll, her owl companion watching you with knowing eyes*" }
        ];
      case "Apollo":
        return [
          { 
            text: "The light of prophecy shines upon you! I am Apollo, god of light, music, and truth. What harmony do you seek?",
            options: [
              { text: "Could you play something on your lyre?", nextLine: 1 },
              { text: "What truths can you reveal to me?", nextLine: 2 }
            ]
          },
          { 
            text: "Ah, an appreciation for divine music! *Apollo strums a short, beautiful melody that seems to make the air itself glow*",
            options: [
              { text: "That was beautiful!", nextLine: 3 },
              { text: "Can music reveal truth?", nextLine: 2 }
            ]
          },
          { 
            text: "Truth is like sunlight - it illuminates all it touches, yet too much can blind you. Seek it gradually, with respect for its power.",
            options: [
              { text: "Is my future predetermined?", nextLine: 4 },
              { text: "Thank you for your wisdom.", nextLine: 5 }
            ]
          },
          { 
            text: "Music is the purest form of truth. It speaks directly to the soul without the confusion of words. Listen carefully, and you will hear the rhythm of the cosmos.",
            options: [
              { text: "I'll try to listen more deeply.", nextLine: 5 }
            ]
          },
          { 
            text: "The threads of fate are woven with choices. I see possibilities, not certainties. Your actions write your story, though the gods may influence its chapters.",
            options: [
              { text: "That's both comforting and terrifying.", nextLine: 5 }
            ]
          },
          { text: "*Apollo's attention turns to the horizon, perhaps seeing distant events unfolding in the future's light*" }
        ];
      case "Artemis":
        return [
          { 
            text: "You tread on Olympus, mortal. I am Artemis, goddess of the hunt and wilderness. State your purpose quickly.",
            options: [
              { text: "I meant no intrusion, Lady Artemis.", nextLine: 1 },
              { text: "I'm exploring this divine realm.", nextLine: 2 }
            ]
          },
          { 
            text: "Yet intrude you have. Fortunately for you, I'm here for the council, not the hunt. My arrows rarely miss their mark.",
            options: [
              { text: "You must be an incredible archer.", nextLine: 3 },
              { text: "I'll be on my way then.", nextLine: 5 }
            ]
          },
          { 
            text: "Exploration requires respect. The wild places of the world belong to themselves, not to visitors. Remember this.",
            options: [
              { text: "Do you protect all wilderness?", nextLine: 4 },
              { text: "I always try to respect nature.", nextLine: 4 }
            ]
          },
          { 
            text: "I am unmatched with the bow. The beasts of the forest know my step, and the moon itself guides my aim.",
            options: [
              { text: "Could you teach me something about archery?", nextLine: 4 },
              { text: "I should leave you to your divine business.", nextLine: 5 }
            ]
          },
          { 
            text: "Perhaps there is hope for mortals after all. Treat the wild with reverence, and you may find it treats you kindly in return.",
            options: [
              { text: "Thank you for your wisdom, Goddess.", nextLine: 5 }
            ]
          },
          { text: "*Artemis turns her attention to the distant forests, her thoughts already returning to the wild*" }
        ];
      case "Hermes":
        return [
          { 
            text: "Hello there! Hermes at your service - messenger of the gods, guide of travelers, and occasional trickster. Need a message delivered?",
            options: [
              { text: "You seem more approachable than the other gods.", nextLine: 1 },
              { text: "Have you traveled everywhere?", nextLine: 2 }
            ]
          },
          { 
            text: "That's my specialty! I walk between worlds - Olympus, Earth, even the Underworld. Makes you less stuffy when you see everything, you know?",
            options: [
              { text: "What's it like delivering messages to the gods?", nextLine: 3 },
              { text: "Have you ever played tricks on Zeus?", nextLine: 4 }
            ]
          },
          { 
            text: "Almost! From the highest peak of Olympus to the depths of Tartarus. The Underworld isn't my favorite spot, but someone's got to guide souls!",
            options: [
              { text: "You guide souls to the afterlife?", nextLine: 3 },
              { text: "What's your favorite place?", nextLine: 4 }
            ]
          },
          { 
            text: "It's all about speed and knowing your audience. Zeus wants respect, Hera notices everything, and never, EVER read Apollo's poetry out loud.",
            options: [
              { text: "Sounds challenging!", nextLine: 5 },
              { text: "Any message-delivery advice?", nextLine: 5 }
            ]
          },
          { 
            text: "Let's just say I've borrowed a few lightning bolts in my day. Between us, his face turns a fascinating shade of purple when he's angry!",
            options: [
              { text: "You're brave to tease the king of gods!", nextLine: 5 },
              { text: "I should go before I learn something too dangerous.", nextLine: 5 }
            ]
          },
          { text: "*Hermes winks and adjusts his winged sandals, ready to dash off at a moment's notice*" }
        ];
      default:
        return [
          { 
            text: "Greetings, mortal. What brings you to Olympus?",
            options: [
              { text: "Just exploring.", nextLine: 1 },
              { text: "I'll be on my way.", nextLine: 1 }
            ]
          },
          { text: "May the gods look favorably upon your journey." }
        ];
    }
  };

  const handleSelectOption = (nextLine: number) => {
    setCurrentLine(nextLine);
  };

  return (
    <div className="olympus-card fixed right-4 w-80 max-h-[60vh] overflow-hidden flex flex-col">
      <div className="flex items-center p-3 border-b bg-background/95">
        <Avatar className="h-10 w-10 mr-2">
          <div className="bg-primary/20 w-full h-full flex items-center justify-center">
            <span className="font-serif text-lg">{godName.charAt(0)}</span>
          </div>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-serif text-lg">{godName}</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-full"
          onClick={onClose}
        >
          ✕
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-background/80">
        <div className="prose prose-sm">
          <p className="font-serif">{displayedText}</p>
          {isTyping && <span className="animate-pulse">...</span>}
        </div>
      </div>
      
      {!isTyping && currentLine < dialogue.length && dialogue[currentLine].options && (
        <div className="p-3 border-t bg-background/95 space-y-2">
          {dialogue[currentLine].options?.map((option, index) => (
            <Button 
              key={index}
              variant="outline" 
              className="w-full justify-start text-left h-auto py-2 font-normal text-sm"
              onClick={() => handleSelectOption(option.nextLine)}
            >
              {option.text}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
