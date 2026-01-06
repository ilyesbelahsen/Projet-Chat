interface AvatarProps {
  name: string;
}

const Avatar = ({ name }: AvatarProps) => {
  return (
    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

export default Avatar;
