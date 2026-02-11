import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Train, Bus, Hotel, Calendar, Clock, Users, MapPin, ArrowRight, ArrowLeft, CreditCard, Smartphone, Building2, CheckCircle2, AlertCircle, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const BOOKINGS_STORAGE_KEY = 'tacttrip_custom_bookings';

const BookingSummary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transportData, setTransportData] = useState<any>(null);
  const [hotelData, setHotelData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | ''>('');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const transport = sessionStorage.getItem('selectedTransport');
    const hotel = sessionStorage.getItem('selectedHotel');
    if (!transport || !hotel) {
      toast.error('Please complete your booking selections first');
      navigate('/flights');
      return;
    }
    setTransportData(JSON.parse(transport));
    setHotelData(JSON.parse(hotel));
  }, [navigate]);

  const budget = useMemo(() => {
    if (!transportData || !hotelData) return null;
    const transportCost = transportData.transport.cost * transportData.passengers;
    const hotelCost = hotelData.hotel.pricePerNight * hotelData.nights;
    const dailyExpense = 1500 * hotelData.nights;
    const totalEstimated = transportCost + hotelCost + dailyExpense;
    return {
      transportCost,
      hotelCost,
      dailyExpense,
      nights: hotelData.nights,
      totalEstimated,
    };
  }, [transportData, hotelData]);

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="w-5 h-5" />;
      case 'train': return <Train className="w-5 h-5" />;
      case 'bus': return <Bus className="w-5 h-5" />;
      default: return <Plane className="w-5 h-5" />;
    }
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (paymentMethod === 'upi' && !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID');
      return;
    }
    if (paymentMethod === 'card' && (cardNumber.length < 16 || !cardExpiry || !cardCvv)) {
      toast.error('Please enter valid card details');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);

      // Save booking to localStorage
      const booking = {
        id: `custom-${Date.now()}`,
        type: 'custom',
        transport: transportData,
        hotel: hotelData,
        totalCost: budget?.totalEstimated || 0,
        paymentMethod,
        bookedAt: new Date().toISOString(),
        status: 'upcoming',
        userName: user?.name || 'Guest',
      };
      const existing = JSON.parse(localStorage.getItem(BOOKINGS_STORAGE_KEY) || '[]');
      existing.push(booking);
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(existing));

      // Also save to the unified bookings
      const unifiedKey = 'tacttrip_package_bookings';
      const unifiedExisting = JSON.parse(localStorage.getItem(unifiedKey) || '[]');
      unifiedExisting.push({
        id: booking.id,
        packageId: 'custom',
        packageName: `${transportData.source} → ${transportData.destination}`,
        destination: transportData.destination,
        duration: `${hotelData.nights}N/${hotelData.nights + 1}D`,
        image: hotelData.hotel.image,
        price: budget?.totalEstimated || 0,
        travelDate: transportData.travelDate,
        travelers: transportData.passengers,
        bookedAt: booking.bookedAt,
        status: 'upcoming',
      });
      localStorage.setItem(unifiedKey, JSON.stringify(unifiedExisting));

      sessionStorage.removeItem('selectedTransport');
      sessionStorage.removeItem('selectedHotel');

      toast.success('Payment successful! Booking confirmed.');
    }, 2500);
  };

  if (!transportData || !hotelData || !budget) return null;

  if (isPaid) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <div className="py-16">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">Booking Confirmed!</h1>
              <p className="text-muted-foreground mb-2">
                Your trip from {transportData.source} to {transportData.destination} has been booked successfully.
              </p>
              <p className="text-lg font-semibold text-primary mb-8">
                Total Paid: ₹{budget.totalEstimated.toLocaleString()}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline">
                  <a href="/bookings">View My Bookings</a>
                </Button>
                <Button asChild className="gradient-hero">
                  <a href="/flights">Book Another Trip</a>
                </Button>
              </div>
            </div>
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
        <div className="container mx-auto px-4">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8 text-sm">
            <Badge variant="secondary" className="bg-primary/10 text-primary">✓ Transport</Badge>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <Badge variant="secondary" className="bg-primary/10 text-primary">✓ Hotel</Badge>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <Badge className="bg-primary text-primary-foreground">3. Summary & Payment</Badge>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Booking Details */}
            <div className="lg:col-span-3 space-y-6">
              <h1 className="text-2xl font-bold text-foreground">Booking Summary</h1>

              {/* Transport Card */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {getTransportIcon(transportData.transport.type)}
                    Transport Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-medium text-foreground">{transportData.source} → {transportData.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Operator</span>
                    <span className="font-medium text-foreground">{transportData.transport.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-foreground">{new Date(transportData.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-foreground">{transportData.transport.departureTime} → {transportData.transport.arrivalTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passengers</span>
                    <span className="font-medium text-foreground">{transportData.passengers}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-foreground">Subtotal</span>
                    <span className="font-bold text-primary">₹{budget.transportCost.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Hotel Card */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Hotel className="w-5 h-5" />
                    Hotel Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-4">
                    <img src={hotelData.hotel.image} alt={hotelData.hotel.name} className="w-24 h-24 rounded-lg object-cover" />
                    <div>
                      <h3 className="font-semibold text-foreground">{hotelData.hotel.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {hotelData.hotel.distance}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        ⭐ {hotelData.hotel.rating.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium text-foreground">{new Date(hotelData.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium text-foreground">{new Date(hotelData.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">{hotelData.nights} night{hotelData.nights > 1 ? 's' : ''}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-foreground">Subtotal</span>
                    <span className="font-bold text-primary">₹{budget.hotelCost.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Section */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'upi' as const, label: 'UPI', icon: Smartphone, desc: 'GPay, PhonePe, etc.' },
                      { key: 'card' as const, label: 'Card', icon: CreditCard, desc: 'Credit / Debit' },
                      { key: 'netbanking' as const, label: 'Net Banking', icon: Building2, desc: 'Bank Transfer' },
                    ].map(({ key, label, icon: Icon, desc }) => (
                      <button
                        key={key}
                        onClick={() => setPaymentMethod(key)}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          paymentMethod === key
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === key ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="space-y-2">
                      <Label>UPI ID</Label>
                      <Input
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="h-11"
                      />
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Card Number</Label>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                          className="h-11"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Expiry</Label>
                          <Input
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CVV</Label>
                          <Input
                            type="password"
                            placeholder="***"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="p-4 rounded-lg bg-secondary/50 text-center">
                      <p className="text-sm text-muted-foreground">You will be redirected to your bank's secure portal to complete the payment.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Budget Analysis */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/50 sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PiggyBank className="w-5 h-5 text-primary" />
                    Real-Time Budget Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Transport */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        {getTransportIcon(transportData.transport.type)}
                        Transport
                      </span>
                      <span className="font-medium text-foreground">₹{budget.transportCost.toLocaleString()}</span>
                    </div>
                    <Progress value={(budget.transportCost / budget.totalEstimated) * 100} className="h-2" />
                  </div>

                  {/* Hotel */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Hotel className="w-4 h-4" />
                        Accommodation ({hotelData.nights}N)
                      </span>
                      <span className="font-medium text-foreground">₹{budget.hotelCost.toLocaleString()}</span>
                    </div>
                    <Progress value={(budget.hotelCost / budget.totalEstimated) * 100} className="h-2" />
                  </div>

                  {/* Daily Expenses */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Daily Expenses</span>
                      <span className="font-medium text-foreground">₹{budget.dailyExpense.toLocaleString()}</span>
                    </div>
                    <Progress value={(budget.dailyExpense / budget.totalEstimated) * 100} className="h-2" />
                  </div>

                  <Separator />

                  {/* Cost Breakdown Percentages */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transport Share</span>
                      <span className="font-medium text-foreground">{((budget.transportCost / budget.totalEstimated) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hotel Share</span>
                      <span className="font-medium text-foreground">{((budget.hotelCost / budget.totalEstimated) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expenses Share</span>
                      <span className="font-medium text-foreground">{((budget.dailyExpense / budget.totalEstimated) * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-xl">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="font-bold text-primary">₹{budget.totalEstimated.toLocaleString()}</span>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={!paymentMethod || isProcessing}
                    className="w-full h-12 gradient-hero text-lg font-semibold"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Processing Payment...
                      </span>
                    ) : (
                      `Pay ₹${budget.totalEstimated.toLocaleString()}`
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    🔒 Secure payment • Instant confirmation
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingSummary;
