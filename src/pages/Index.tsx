
import { useState } from "react";
import ZodiacForm from "@/components/ZodiacForm";

const Index = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-olympus">
      {/* Header */}
      <header className="pt-12 pb-6 px-4 text-center animate-fade-in">
        <div className="inline-block mb-2">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            Mythical Journey
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold max-w-3xl mx-auto">
          Olympus
        </h1>
        <p className="mt-3 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Embark on a personalized adventure through mythology based on your zodiac destiny
        </p>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <ZodiacForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground animate-fade-in">
        <p>Where mythology meets your destiny</p>
      </footer>
    </div>
  );
};

export default Index;
