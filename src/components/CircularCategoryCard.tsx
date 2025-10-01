interface CircularCategoryCardProps {
  title: string;
  image: string;
  onClick?: () => void;
}

export const CircularCategoryCard = ({ title, image, onClick }: CircularCategoryCardProps) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-3 cursor-pointer group"
    >
      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-border group-hover:border-primary transition-all duration-300 shadow-lg group-hover:shadow-xl">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <h3 className="text-sm md:text-base font-semibold text-center group-hover:text-primary transition-colors max-w-[140px]">
        {title}
      </h3>
    </div>
  );
};
