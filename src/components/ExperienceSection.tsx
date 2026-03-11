import { Camera, Utensils, ShoppingBag, MapPin, Navigation } from 'lucide-react';
import { Attraction, NearbyPlace } from '@/types/travel';

interface ExperienceSectionProps {
  attractions: Attraction[];
  food: Attraction[];
  shopping: Attraction[];
  destination: string;
  nearbyPlaces?: NearbyPlace[];
}

const ExperienceSection = ({ attractions, food, shopping, destination, nearbyPlaces }: ExperienceSectionProps) => {
  const sections = [
    {
      title: 'Tourist Attractions',
      icon: Camera,
      items: attractions,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Food & Dining',
      icon: Utensils,
      items: food,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Shopping Spots',
      icon: ShoppingBag,
      items: shopping,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          Explore {destination}
        </h2>
        <p className="text-muted-foreground mt-1">Curated local experiences for your trip</p>
      </div>

      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <div key={section.title}>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <div className={`p-2 rounded-lg ${section.bgColor}`}>
                <Icon className={`w-4 h-4 ${section.color}`} />
              </div>
              {section.title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="group overflow-hidden rounded-xl border border-border bg-card shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400';
                      }}
                    />
                    {item.category && (
                      <span className="absolute top-2 right-2 px-2 py-1 bg-card/90 backdrop-blur-sm text-xs font-medium rounded-md">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {nearbyPlaces && nearbyPlaces.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Navigation className="w-4 h-4 text-green-500" />
            </div>
            Nearby Tourist Places
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyPlaces.map((place) => (
              <div
                key={place.id}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400';
                    }}
                  />
                  <span className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-md">
                    <MapPin className="w-3 h-3" />
                    {place.distance}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-foreground">{place.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {place.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceSection;
