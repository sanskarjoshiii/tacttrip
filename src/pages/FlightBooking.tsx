import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Train, Bus, MapPin, Calendar, Clock, Star, Sparkles, Check, ArrowRight, Loader2, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransportData } from '@/hooks/useTransportData';
import { TransportOption } from '@/types/travel';
import { popularSources, popularDestinations } from '@/data/mockData';
import { toast } from 'sonner';

const FlightBooking = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [searched, setSearched] = useState(false);
  const [searchSource, setSearchSource] = useState('');
  const [searchDestination, setSearchDestination] = useState('');

  const { transport, isLoading } = useTransportData(searchSource, searchDestination);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !destination.trim() || !travelDate) {
      toast.error('Please fill in all fields');
      return;
    }
    if (source.toLowerCase() === destination.toLowerCase()) {
      toast.error('Source and destination must be different');
      return;
    }
    setSearchSource(source.trim());
    setSearchDestination(destination.trim());
    setSearched(true);
  };

  const handleSelectTransport = (option: TransportOption) => {
    const bookingData = {
      transport: option,
      source: searchSource,
      destination: searchDestination,
      travelDate,
      passengers: parseInt(passengers),
    };
    sessionStorage.setItem('selectedTransport', JSON.stringify(bookingData));
    toast.success(`${option.name} selected!`);
    navigate('/hotels-booking');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="w-5 h-5" />;
      case 'train': return <Train className="w-5 h-5" />;
      case 'bus': return <Bus className="w-5 h-5" />;
      default: return <Plane className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flight': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'train': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'bus': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Book Your Transport
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Search flights, trains & buses. Select your preferred option and proceed to hotel booking.
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-3xl mx-auto mb-10 border-border/50 shadow-card">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-green-500" />
                      From
                    </Label>
                    <Input
                      placeholder="e.g., Mumbai"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="h-12"
                      list="flight-sources"
                    />
                    <datalist id="flight-sources">
                      {popularSources.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-destructive" />
                      To
                    </Label>
                    <Input
                      placeholder="e.g., Delhi"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="h-12"
                      list="flight-destinations"
                    />
                    <datalist id="flight-destinations">
                      {popularDestinations.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-primary" />
                      Travel Date
                    </Label>
                    <Input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="h-12"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Users className="w-4 h-4 text-primary" />
                      Passengers
                    </Label>
                    <Select value={passengers} onValueChange={setPassengers}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} Passenger{n > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 gradient-hero text-lg font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Searching...</span>
                  ) : 'Search Transport'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {isLoading && searched && (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Finding best routes from {searchSource} to {searchDestination}...</span>
            </div>
          )}

          {!isLoading && searched && transport.length > 0 && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  {searchSource} → {searchDestination}
                </h2>
                <Badge variant="secondary">{transport.length} options found</Badge>
              </div>

              <div className="space-y-4">
                {transport.map((option, idx) => (
                  <Card key={option.id} className={`overflow-hidden border-2 transition-all hover:shadow-card-hover ${
                    idx === 0 ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'
                  }`}>
                    <CardContent className="p-5">
                      {idx === 0 && (
                        <Badge className="mb-3 bg-primary text-primary-foreground">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Best Option
                        </Badge>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl border ${getTypeColor(option.type)}`}>
                            {getIcon(option.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{option.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{option.type}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {option.duration}
                              </span>
                              <span>•</span>
                              <span>{option.departureTime} → {option.arrivalTime}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${
                                  i < (option.comfort === 'Premium' ? 3 : option.comfort === 'Standard' ? 2 : 1)
                                    ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'
                                }`} />
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">{option.comfort}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground">₹{(option.cost * parseInt(passengers)).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {parseInt(passengers) > 1 ? `₹${option.cost.toLocaleString()} × ${passengers}` : 'per person'}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleSelectTransport(option)}
                            className="gradient-hero gap-2"
                          >
                            Select <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!isLoading && searched && transport.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No transport options found for this route. Try different cities.</p>
            </div>
          )}

          {!searched && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Search for transport</h3>
              <p className="text-muted-foreground">Enter your travel details above to find available options</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightBooking;
