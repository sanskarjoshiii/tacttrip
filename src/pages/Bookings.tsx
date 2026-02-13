import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Hotel, Plane, Package, MoreVertical, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

interface SavedBooking {
  id: string;
  packageId: string;
  packageName: string;
  destination: string;
  duration: string;
  image: string;
  price: number;
  travelDate: string;
  travelers: number;
  bookedAt: string;
  status: 'upcoming' | 'completed';
}

interface MockBooking {
  id: string;
  type: 'hotel' | 'flight' | 'package';
  name: string;
  location: string;
  image: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'upcoming' | 'completed';
  price: number;
  duration?: string;
}

const BOOKINGS_STORAGE_KEY = 'tacttrip_package_bookings';

// Mock bookings data (hotels/flights)
const mockBookings: MockBooking[] = [
  {
    id: '1',
    type: 'hotel',
    name: 'The Grand Palace Hotel',
    location: 'Mumbai, Maharashtra',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
    checkIn: '2025-02-15',
    checkOut: '2025-02-18',
    guests: 2,
    status: 'upcoming',
    price: 12500,
  },
  {
    id: '2',
    type: 'hotel',
    name: 'Heritage Inn Jaipur',
    location: 'Jaipur, Rajasthan',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80',
    checkIn: '2025-01-10',
    checkOut: '2025-01-12',
    guests: 2,
    status: 'completed',
    price: 8500,
  },
];

const Bookings = () => {
  const { user } = useAuth();
  const [packageBookings, setPackageBookings] = useState<SavedBooking[]>([]);
  
  useEffect(() => {
    // Load package bookings from localStorage
    const savedBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (savedBookings) {
      try {
        const bookings: SavedBooking[] = JSON.parse(savedBookings);
        // Update status based on travel date
        const updatedBookings = bookings.map(booking => ({
          ...booking,
          status: new Date(booking.travelDate) > new Date() ? 'upcoming' : 'completed'
        })) as SavedBooking[];
        setPackageBookings(updatedBookings);
      } catch {
        console.error('Failed to parse bookings');
      }
    }
  }, []);

  // Convert package bookings to common format
  const convertedPackageBookings: MockBooking[] = packageBookings.map(pkg => ({
    id: pkg.id,
    type: 'package' as const,
    name: pkg.packageName,
    location: pkg.destination,
    image: pkg.image,
    checkIn: pkg.travelDate,
    checkOut: '',
    guests: pkg.travelers,
    status: pkg.status,
    price: pkg.price,
    duration: pkg.duration
  }));

  const allBookings = [...mockBookings, ...convertedPackageBookings];
  const upcomingBookings = allBookings.filter(b => b.status === 'upcoming');
  const completedBookings = allBookings.filter(b => b.status === 'completed');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel': return <Hotel className="w-4 h-4 text-primary" />;
      case 'flight': return <Plane className="w-4 h-4 text-primary" />;
      case 'package': return <Package className="w-4 h-4 text-primary" />;
      default: return <Hotel className="w-4 h-4 text-primary" />;
    }
  };

  const BookingCard = ({ booking }: { booking: MockBooking }) => (
    <Card className="overflow-hidden border-border/50 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-40 h-32 sm:h-auto relative overflow-hidden">
          <img
            src={booking.image}
            alt={booking.name}
            className="w-full h-full object-cover"
          />
          <Badge 
            className={`absolute top-2 left-2 ${
              booking.status === 'upcoming' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {booking.status === 'upcoming' ? 'Upcoming' : 'Completed'}
          </Badge>
          {booking.type === 'package' && (
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
              Package
            </Badge>
          )}
        </div>
        
        <CardContent className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getTypeIcon(booking.type)}
                <h3 className="font-semibold text-foreground">{booking.name}</h3>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{booking.location}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {formatDate(booking.checkIn)}
                {booking.checkOut && ` - ${formatDate(booking.checkOut)}`}
              </span>
            </div>
            {booking.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{booking.duration}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{booking.guests} {booking.type === 'package' ? 'traveler(s)' : 'guest(s)'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">₹{booking.price.toLocaleString()}</span>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/booking-details/${booking.id}`}>View Details</Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Here are your travel bookings.
            </p>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming" className="relative">
                Upcoming
                {upcomingBookings.length > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground text-xs">
                    {upcomingBookings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                {completedBookings.length > 0 && (
                  <Badge className="ml-2 bg-muted text-muted-foreground text-xs">
                    {completedBookings.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No upcoming bookings</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Start planning your next adventure!
                    </p>
                    <div className="flex gap-3">
                      <Button asChild variant="outline">
                        <Link to="/plan">Plan a Trip</Link>
                      </Button>
                      <Button asChild className="gradient-hero">
                        <Link to="/packages">Browse Packages</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedBookings.length > 0 ? (
                completedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No completed bookings</h3>
                    <p className="text-muted-foreground text-center">
                      Your past bookings will appear here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Bookings;
