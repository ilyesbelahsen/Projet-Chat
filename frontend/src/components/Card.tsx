import React from "react";
import { Icon } from "lucide-react";

interface CardProps {
  title: string;
  onClick: () => void;
  icon?: Icon;
  description?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  onClick,
  icon: IconComponent,
  description,
}) => {
  return (
    <div
      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
      onClick={onClick}
    >
      {IconComponent && (
        <IconComponent className="w-10 h-10 text-blue-600 mb-4" />
      )}
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      {description && <p className="text-gray-500 text-sm">{description}</p>}
    </div>
  );
};

export default Card;
