import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Wifi, Car, Coffee, Calendar, Loader2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHotelData } from '@/hooks/useHotelData';
import { HotelOption } from '@/types/travel';
import { toast } from 'sonner';

const HotelBooking = () => {
  const navigate = useNavigate();
  const [transportData, setTransportData] = useState<any>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<HotelOption | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedTransport');
    if (!stored) {
      toast.error('Please select transport first');
      navigate('/flights');
      return;
    }
    const data = JSON.parse(stored);
    setTransportData(data);
    // Default check-in to travel date
    if (data.travelDate) {
      setCheckIn(data.travelDate);
      // Default check-out to next day
      const next = new Date(data.travelDate);
      next.setDate(next.getDate() + 2);
      setCheckOut(next.toISOString().split('T')[0]);
    }
  }, [navigate]);

  const destination = transportData?.destination || '';
  const { hotels, isLoading } = useHotelData(destination);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();

  const handleSelectHotel = (hotel: HotelOption) => {
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error('Check-out must be after check-in');
      return;
    }
    setSelectedHotel(hotel);
  };

  const handleProceed = () => {
    if (!selectedHotel) return;
    const hotelBooking = {
      hotel: selectedHotel,
      checkIn,
      checkOut,
      nights,
    };
    sessionStorage.setItem('selectedHotel', JSON.stringify(hotelBooking));
    navigate('/booking-summary');
  };

  const amenityIcons: Record<string, React.ReactNode> = {
    'WiFi': <Wifi className="w-3 h-3" />,
    'Parking': <Car className="w-3 h-3" />,
    'Restaurant': <Coffee className="w-3 h-3" />,
  };

  if (!transportData) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8 text-sm">
            <Badge variant="secondary" className="bg-primary/10 text-primary">✓ Transport Selected</Badge>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <Badge className="bg-primary text-primary-foreground">2. Select Hotel</Badge>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <Badge variant="secondary">3. Summary & Pay</Badge>
          </div>

          {/* Transport Summary */}
          <Card className="max-w-3xl mx-auto mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Selected Transport</p>
                <p className="font-semibold text-foreground">
                  {transportData.transport.name} • {transportData.source} → {transportData.destination}
                </p>
                <p className="text-sm text-muted-foreground">
                  {transportData.travelDate} • {transportData.passengers} passenger(s) • ₹{(transportData.transport.cost * transportData.passengers).toLocaleString()}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/flights')}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Change
              </Button>
            </CardContent>
          </Card>

          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Choose Your Stay in {destination}
            </h1>
          </div>

          {/* Date Selection */}
          <Card className="max-w-3xl mx-auto mb-8 border-border/50">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-4 h-4 text-primary" />
                    Check-in
                  </Label>
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={transportData.travelDate || new Date().toISOString().split('T')[0]}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-4 h-4 text-primary" />
                    Check-out
                  </Label>
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className="h-11"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <Badge variant="secondary" className="text-base px-4 py-2">
                    {nights} Night{nights > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hotels */}
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Searching hotels in {destination}...</span>
            </div>
          ) : hotels.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-4">
              <h2 className="text-lg font-semibold text-foreground">{hotels.length} hotels found</h2>
              {hotels.map((hotel) => {
                const totalCost = hotel.pricePerNight * nights;
                const isSelected = selectedHotel?.id === hotel.id;
                return (
                  <Card key={hotel.id} className={`overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border/50 hover:border-primary/30'
                  }`} onClick={() => handleSelectHotel(hotel)}>
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 h-40 sm:h-auto relative overflow-hidden">
                        <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                        <Badge className="absolute top-2 right-2 bg-background/90 text-foreground">
                          <Star className="w-3 h-3 mr-1 text-amber-500 fill-amber-500" />
                          {hotel.rating.toFixed(1)}
                        </Badge>
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="bg-primary text-primary-foreground rounded-full p-2">
                              <Check className="w-6 h-6" />
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="flex-1 p-4">
                        <h3 className="font-semibold text-foreground text-lg mb-1">{hotel.name}</h3>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{hotel.distance} from center</span>
                        </div>
                        {hotel.amenities && hotel.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {hotel.amenities.slice(0, 4).map((amenity) => (
                              <Badge key={amenity} variant="secondary" className="text-xs">
                                {amenityIcons[amenity] || null}
                                <span className="ml-1">{amenity}</span>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-primary">₹{hotel.pricePerNight.toLocaleString()}</span>
                            <span className="text-muted-foreground text-sm">/night</span>
                            <p className="text-sm text-muted-foreground">
                              Total: ₹{totalCost.toLocaleString()} for {nights} night{nights > 1 ? 's' : ''}
                            </p>
                          </div>
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={isSelected ? "gradient-hero" : ""}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectHotel(hotel);
                            }}
                          >
                            {isSelected ? '✓ Selected' : 'Select'}
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}

              {/* Proceed Button */}
              {selectedHotel && (
                <div className="sticky bottom-4 bg-card border border-border rounded-xl p-4 shadow-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{selectedHotel.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{(selectedHotel.pricePerNight * nights).toLocaleString()} for {nights} night{nights > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button onClick={handleProceed} className="gradient-hero gap-2">
                    Proceed to Summary <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No hotels found in {destination}.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HotelBooking;
