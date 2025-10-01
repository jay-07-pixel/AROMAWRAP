import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  title: string;
  image: string;
  onClick?: () => void;
}

export const CategoryCard = ({ title, image, onClick }: CategoryCardProps) => {
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-xl"
    >
      <div className="aspect-square relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4 text-center">
        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
    </Card>
  );
};
