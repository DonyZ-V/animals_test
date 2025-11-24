import React, { useState } from 'react';
import { AnimalCard } from './components/AnimalCard';
import { ANIMALS } from './constants';
import { Animal } from './types';
import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData } from './utils/audioUtils';

// Initialize AI outside component to avoid recreation
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App: React.FC = () => {
  const [activeAnimal, setActiveAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize AudioContext on first user interaction to bypass autoplay policies
  const initAudio = () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      setAudioContext(ctx);
    } else if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  };

  const playGreeting = async (animal: Animal) => {
    if (!audioContext) return;
    setLoading(true);

    try {
      // Prompt engineered for a Chinese toddler audience
      const prompt = `
        Role: You are a friendly, cute ${animal.englishName} character.
        Audience: A 2-3 year old Chinese child.
        Language: Simple, cheerful Chinese (Mandarin).
        Task:
        1. Make the sound a ${animal.englishName} makes ("${animal.sound}").
        2. Say hello warmly saying "我是${animal.name}" (I am a ${animal.name}).
        3. Say one very simple, cute sentence about what you like to do.
        Keep it under 10 seconds. Be very expressive and energetic!
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore works reasonably well for cheerful tones
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        const audioBuffer = await decodeAudioData(
          decode(base64Audio),
          audioContext,
          24000,
          1
        );

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (error) {
      console.error("Failed to generate speech", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimalClick = (animal: Animal) => {
    initAudio();
    setActiveAnimal(animal);
    playGreeting(animal);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-green-600 drop-shadow-sm tracking-wider mb-2">
          宝宝动物园 🦁
        </h1>
        <p className="text-gray-500 text-lg md:text-xl">点一点小动物，听听它们说什么！</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl w-full">
        {ANIMALS.map((animal) => (
          <AnimalCard
            key={animal.id}
            animal={animal}
            isActive={activeAnimal?.id === animal.id}
            isLoading={loading && activeAnimal?.id === animal.id}
            onClick={() => handleAnimalClick(animal)}
          />
        ))}
      </div>

      <div className="mt-12 text-center text-gray-400 text-xs">
        Powered by Gemini 2.5
      </div>
    </div>
  );
};

export default App;