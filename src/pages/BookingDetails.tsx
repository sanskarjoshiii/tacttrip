import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Clock, Hotel, Plane, Package, Users, Phone, Mail, Download, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

interface BookingDetail {
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
  packageName?: string;
  travelDate?: string;
  travelers?: number;
  bookedAt?: string;
}

const BOOKINGS_STORAGE_KEY = 'tacttrip_package_bookings';

const mockBookings = [
  {
    id: '1',
    type: 'hotel' as const,
    name: 'The Grand Palace Hotel',
    location: 'Mumbai, Maharashtra',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    checkIn: '2025-02-15',
    checkOut: '2025-02-18',
    guests: 2,
    status: 'upcoming' as const,
    price: 12500,
  },
  {
    id: '2',
    type: 'hotel' as const,
    name: 'Heritage Inn Jaipur',
    location: 'Jaipur, Rajasthan',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    checkIn: '2025-01-10',
    checkOut: '2025-01-12',
    guests: 2,
    status: 'completed' as const,
    price: 8500,
  },
];

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingDetail | null>(null);

  useEffect(() => {
    // Check mock bookings first
    const mock = mockBookings.find(b => b.id === id);
    if (mock) {
      setBooking(mock);
      return;
    }

    // Check localStorage package bookings
    const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (saved) {
      try {
        const pkgs = JSON.parse(saved);
        const pkg = pkgs.find((p: any) => p.id === id);
        if (pkg) {
          setBooking({
            id: pkg.id,
            type: 'package',
            name: pkg.packageName,
            location: pkg.destination,
            image: pkg.image,
            checkIn: pkg.travelDate,
            checkOut: '',
            guests: pkg.travelers,
            status: new Date(pkg.travelDate) > new Date() ? 'upcoming' : 'completed',
            price: pkg.price,
            duration: pkg.duration,
            bookedAt: pkg.bookedAt,
          });
        }
      } catch {
        console.error('Failed to parse bookings');
      }
    }
  }, [id]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel': return <Hotel className="w-5 h-5" />;
      case 'flight': return <Plane className="w-5 h-5" />;
      case 'package': return <Package className="w-5 h-5" />;
      default: return <Hotel className="w-5 h-5" />;
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Booking Not Found</h2>
            <p className="text-muted-foreground mb-6">The booking you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/bookings">Back to Bookings</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate('/bookings')} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Bookings
          </Button>

          {/* Hero Image */}
          <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 mb-8">
            <img src={booking.image} alt={booking.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={booking.status === 'upcoming' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}>
                  {booking.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                </Badge>
                <Badge variant="outline" className="bg-background/20 text-white border-white/30 backdrop-blur-sm">
                  {getTypeIcon(booking.type)}
                  <span className="ml-1 capitalize">{booking.type}</span>
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{booking.name}</h1>
              <div className="flex items-center gap-1 text-white/80 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{booking.location}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in / Travel Date</p>
                        <p className="font-medium text-foreground">{formatDate(booking.checkIn)}</p>
                      </div>
                    </div>
                    {booking.checkOut && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Check-out</p>
                          <p className="font-medium text-foreground">{formatDate(booking.checkOut)}</p>
                        </div>
                      </div>
                    )}
                    {booking.duration && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-medium text-foreground">{booking.duration}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">{booking.type === 'package' ? 'Travelers' : 'Guests'}</p>
                        <p className="font-medium text-foreground">{booking.guests}</p>
                      </div>
                    </div>
                  </div>

                  {booking.bookedAt && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Booked On</p>
                          <p className="font-medium text-foreground">{formatDate(booking.bookedAt)}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Guest Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Guest Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium text-foreground">{user?.name || 'Guest'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{user?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">+91 98765 43210</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Summary Sidebar */}
            <div className="space-y-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Price Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Price</span>
                    <span className="text-foreground">₹{booking.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes & Fees</span>
                    <span className="text-foreground">₹{Math.round(booking.price * 0.12).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span className="text-foreground">Total Paid</span>
                    <span className="text-primary text-lg">₹{Math.round(booking.price * 1.12).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking ID</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-sm text-muted-foreground bg-muted p-3 rounded-lg break-all">
                    {booking.id.toUpperCase().slice(0, 8)}-TACT
                  </p>
                </CardContent>
              </Card>

              <Button className="w-full gap-2" variant="outline">
                <Download className="w-4 h-4" />
                Download Invoice
              </Button>

              {booking.status === 'upcoming' && (
                <Button className="w-full" variant="destructive">
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingDetails;
