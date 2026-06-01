import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean; // Kept for interface compatibility, though the image likely contains the text or symbol
}

const Logo: React.FC<LogoProps> = ({ className = "h-8" }) => {
  return (
    <div className="flex items-center gap-2">
      <img 
        src="https://ik.imagekit.io/npgvdrjfb/Nuexis-Logo-transparent%20(4)-Picsart-BackgroundChanger.png?updatedAt=1740762302755" 
        alt="NuExis Logo" 
        className={`${className} w-auto object-contain`}
      />
    </div>
  );
};

export default Logo;