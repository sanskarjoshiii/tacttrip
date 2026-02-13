import { Star, MapPin, Wifi, Coffee, Car, Waves, Award, CheckCircle2 } from 'lucide-react';
import { HotelOption } from '@/types/travel';
import { Button } from '@/components/ui/button';

interface HotelCardProps {
  hotel: HotelOption;
  nights: number;
  onSelect?: (hotel: HotelOption) => void;
  isSelected?: boolean;
}

const HotelCard = ({ hotel, nights, onSelect, isSelected }: HotelCardProps) => {
  const totalCost = hotel.pricePerNight * nights;

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, JSX.Element> = {
      WiFi: <Wifi className="w-3 h-3" />,
      Breakfast: <Coffee className="w-3 h-3" />,
      Parking: <Car className="w-3 h-3" />,
      Pool: <Waves className="w-3 h-3" />,
    };
    return icons[amenity] || null;
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border-2 transition-all duration-300 bg-card cursor-pointer
        ${isSelected
          ? 'border-primary shadow-card-hover ring-2 ring-primary/20'
          : hotel.isBestValue 
            ? 'border-success shadow-card-hover ring-2 ring-success/20' 
            : 'border-border shadow-card hover:shadow-card-hover hover:border-primary/30'
        }
      `}
      onClick={() => onSelect?.(hotel)}
    >
      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Selected
        </div>
      )}

      {/* Best Value Badge */}
      {hotel.isBestValue && !isSelected && (
        <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-success text-success-foreground text-xs font-semibold rounded-full flex items-center gap-1">
          <Award className="w-3 h-3" />
          Best Value
        </div>
      )}

      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Rating on image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <Star className="w-4 h-4 text-accent fill-accent" />
          <span className="text-sm font-semibold text-foreground">{hotel.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-lg">{hotel.name}</h3>
        
        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {hotel.distance}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mt-3">
          {hotel.amenities.slice(0, 4).map((amenity) => (
            <span
              key={amenity}
              className="flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
            >
              {getAmenityIcon(amenity)}
              {amenity}
            </span>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-4 pt-4 border-t border-border flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              ₹{hotel.pricePerNight.toLocaleString()}/night
            </p>
            <p className="text-xs text-muted-foreground">{nights} night{nights > 1 ? 's' : ''}</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div>
              <p className="text-xl font-bold text-foreground">
                ₹{totalCost.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">total stay</p>
            </div>
            {onSelect && (
              <Button
                size="sm"
                variant={isSelected ? "default" : "outline"}
                className={isSelected ? "gradient-hero" : ""}
                onClick={(e) => { e.stopPropagation(); onSelect(hotel); }}
              >
                {isSelected ? "Selected" : "Select"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
