import React from 'react';
import { Animal } from '../types';

interface AnimalCardProps {
  animal: Animal;
  isActive: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({ animal, isActive, isLoading, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        relative group flex flex-col items-center
        aspect-square rounded-3xl shadow-lg hover:shadow-2xl
        transition-all duration-300 ease-out
        bg-white overflow-hidden
        ${isActive ? 'scale-105 ring-4 ring-offset-2 ring-purple-400 z-10' : 'hover:scale-[1.02]'}
        active:scale-95
        cursor-pointer
      `}
      aria-label={`Play with ${animal.name}`}
    >
      {/* Image Container */}
      <div className="w-full h-full relative">
        <img 
          src={animal.image} 
          alt={animal.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        
        {/* Name Label */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
          <span className="text-2xl md:text-3xl font-black text-white tracking-widest drop-shadow-md">
            {animal.name}
          </span>
        </div>
      </div>

      {/* Loading/Speaking Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20">
           <div className="flex gap-2">
             <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
             <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
             <div className="w-4 h-4 bg-white rounded-full animate-bounce"></div>
           </div>
        </div>
      )}
      
      {/* Active State Border Highlight */}
      {isActive && (
        <div className="absolute inset-0 border-4 border-purple-400 rounded-3xl pointer-events-none" />
      )}
    </button>
  );
};