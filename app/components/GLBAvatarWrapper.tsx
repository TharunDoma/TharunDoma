"use client";

import GLBAvatar from "./GLBAvatar";
import FloatingAIWidget from "./FloatingAIWidget";

interface GLBAvatarWrapperProps {
  glbData: string;
}

export default function GLBAvatarWrapper({ glbData }: GLBAvatarWrapperProps) {
  return (
    <div 
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex items-end gap-3 md:gap-4"
      style={{ 
        pointerEvents: 'auto'
      }}
    >
      <GLBAvatar 
        glbData={glbData}
        width={180}
        height={250}
      />
      <FloatingAIWidget />
    </div>
  );
}
