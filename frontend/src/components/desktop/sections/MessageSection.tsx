import React, { useState, useEffect } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// const messages = [
//   { name: "Adam, Eve", time: "Today at 3:30 PM", avatar: "A" },
//   { name: "Funny Stuff", time: "Fri, Aug 1 at 1:22 PM", avatar: "F" },
// ];

const funFacts = [
  "Honey never spoils.",
  "A single strand of Spaghetti is called a 'Spaghetto'.",
  "Octopuses have three hearts.",
  "Bananas are berries, but strawberries aren't.",
  "A group of flamingos is called a 'flamboyance'.",
  "The shortest war in history lasted 38 minutes.",
  "There are more stars in the universe than grains of sand on Earth.",
  "A day on Venus is longer than a year on Venus.",
  "Wombat poop is cube-shaped.",
  "Humans share 50% of their DNA with bananas.",
  "A bolt of lightning contains enough energy to toast 100,000 slices of bread.",
  "The Eiffel Tower can be 15 cm taller during the summer.",
  "A snail can sleep for three years.",
  "The inventor of the Pringles can is now buried in one.",
  "There are more fake flamingos in the world than real ones.",
  "A blue whale's heart is the size of a small car.",
  "Scotland's national animal is the unicorn.",
  "The longest hiccuping spree lasted 68 years.",
  "A jiffy is an actual unit of time.",
  "Cows have best friends and get stressed when separated."
];

const MessageSection: React.FC = () => {
  const [displayedFacts, setDisplayedFacts] = useState<string[]>([funFacts[0]]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedFacts((prevFacts) => {
        const nextIndex = prevFacts.length % funFacts.length;
        return [...prevFacts, funFacts[nextIndex]];
      });
    }, 10000); // 10 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);


  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Fun Facts</h2>
      </div>
      <ScrollArea className="h-[330px]">
        {/* {messages.map((message, index) => ( */}
        {displayedFacts.map((fact, index) => (

        <div
          key={index}
          className="flex items-center justify-between mb-3 text-sm border border-gray-300 rounded-md p-2"
        >
            <p>{fact}</p>
            {/* <div className="flex items-center">
              <Avatar className="mr-2 bg-gray-500">
                <AvatarFallback className="text-white bg-gray-500">
                  {message.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span>{message.name}</span>
                <span className="text-xs text-neutral-500">{message.time}</span>
              </div>
            </div> */}
        </div>
        ))}
      </ScrollArea>
    </div>
  );
}

export default MessageSection