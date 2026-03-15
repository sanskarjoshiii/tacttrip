import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plane, Building, RefreshCw, Loader2, ArrowRight, CreditCard, Smartphone, Building2, CheckCircle2, PiggyBank, TrendingDown, TrendingUp, Hotel, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransportCard from '@/components/TransportCard';
import HotelCard from '@/components/HotelCard';
import WeatherWidget from '@/components/WeatherWidget';
import BudgetSummary from '@/components/BudgetSummary';
import ExperienceSection from '@/components/ExperienceSection';
import LoadingState from '@/components/LoadingState';
import { TravelInput, TravelPlan, TransportOption, HotelOption } from '@/types/travel';
import { generateTravelPlan } from '@/utils/aiLogic';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { useTransportData } from '@/hooks/useTransportData';
import { useHotelData } from '@/hooks/useHotelData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type BookingStep = 'explore' | 'summary' | 'payment' | 'confirmed';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [preference, setPreference] = useState<'cheapest' | 'fastest' | 'balanced'>('balanced');
  const [budget, setBudget] = useState(0);

  // Booking state
  const [selectedTransport, setSelectedTransport] = useState<TransportOption | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelOption | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>('explore');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | ''>('');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch real-time data
  const {
    weather: realTimeWeather,
    attractions: realTimeAttractions,
    food: realTimeFood,
    shopping: realTimeShopping,
    nearbyPlaces: realTimeNearbyPlaces,
    activities: realTimeActivities,
    monuments: realTimeMonuments,
    isLoading: isRealTimeLoading,
    refetch: refetchRealTimeData
  } = useRealTimeData(destination);

  const {
    transport: realTimeTransport,
    isLoading: isTransportLoading,
    refetch: refetchTransport
  } = useTransportData(source, destination);

  const {
    hotels: realTimeHotels,
    isLoading: isHotelsLoading,
    refetch: refetchHotels
  } = useHotelData(destination);

  useEffect(() => {
    const storedInput = sessionStorage.getItem('travelInput');
    if (!storedInput) {
      navigate('/plan');
      return;
    }

    const input: TravelInput = JSON.parse(storedInput);
    setSource(input.source);
    setDestination(input.destination);
    setPreference(input.preference);
    setBudget(input.budget);
    
    const timer = setTimeout(() => {
      const plan = generateTravelPlan(input);
      setTravelPlan(plan);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleNewPlan = () => {
    sessionStorage.removeItem('travelInput');
    navigate('/plan');
  };

  const handleRefreshAll = () => {
    refetchRealTimeData();
    refetchTransport();
    refetchHotels();
  };

  // Process transport options
  const processTransportOptions = (options: TransportOption[]): TransportOption[] => {
    if (options.length === 0) return [];
    const sorted = [...options];
    if (preference === 'cheapest') {
      sorted.sort((a, b) => a.cost - b.cost);
    } else if (preference === 'fastest') {
      sorted.sort((a, b) => {
        const getDur = (d: string) => { const p = d.match(/(\d+)h\s*(\d+)?m?/); return p ? parseInt(p[1]) * 60 + (parseInt(p[2]) || 0) : 0; };
        return getDur(a.duration) - getDur(b.duration);
      });
    } else {
      sorted.sort((a, b) => {
        const getDur = (d: string) => { const p = d.match(/(\d+)h\s*(\d+)?m?/); return p ? parseInt(p[1]) * 60 + (parseInt(p[2]) || 0) : 0; };
        return (a.cost * 0.6 + getDur(a.duration) * 10) - (b.cost * 0.6 + getDur(b.duration) * 10);
      });
    }
    const recommended = sorted[0];
    const maxBudget = budget * 0.4;
    const reasons: Record<string, string> = {
      cheapest: 'Recommended for lowest cost within your budget',
      fastest: 'Recommended for quickest travel time',
      balanced: 'Best balance of cost and travel time',
    };
    return sorted.map(o => ({
      ...o,
      isRecommended: o.id === recommended.id && o.cost <= maxBudget,
      reason: o.id === recommended.id && o.cost <= maxBudget ? reasons[preference] : undefined,
    }));
  };

  const processHotels = (hotelList: HotelOption[]): HotelOption[] => {
    if (hotelList.length === 0) return [];
    const bestValue = hotelList.reduce((best, cur) =>
      (cur.rating / cur.pricePerNight) > (best.rating / best.pricePerNight) ? cur : best
    , hotelList[0]);
    return hotelList.map(h => ({ ...h, isBestValue: h.id === bestValue.id }));
  };

  const calculateDays = (): number => {
    if (!travelPlan?.input.startDate || !travelPlan?.input.endDate) return 3;
    const start = new Date(travelPlan.input.startDate);
    const end = new Date(travelPlan.input.endDate);
    return Math.max(1, Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // Real-time budget based on selections
  const liveBudget = useMemo(() => {
    const days = travelPlan ? calculateDays() : 3;
    const transportCost = selectedTransport?.cost || 0;
    const hotelCost = (selectedHotel?.pricePerNight || 0) * days;
    const dailyExpense = 1500 * days;
    const totalEstimated = transportCost + hotelCost + dailyExpense;
    const remaining = budget - totalEstimated;
    return {
      transportCost,
      hotelCost,
      dailyExpense,
      days,
      totalEstimated,
      remaining,
      utilizationPercent: budget > 0 ? (totalEstimated / budget) * 100 : 0,
      isWithinBudget: remaining >= 0,
    };
  }, [selectedTransport, selectedHotel, budget, travelPlan]);

  const handleProceedToSummary = () => {
    if (!selectedTransport || !selectedHotel) {
      toast.error('Please select both transport and hotel');
      return;
    }
    setBookingStep('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToPayment = () => {
    setBookingStep('payment');
  };

  const handlePayment = () => {
    if (!paymentMethod) { toast.error('Please select a payment method'); return; }
    if (paymentMethod === 'upi' && !upiId.includes('@')) { toast.error('Please enter a valid UPI ID'); return; }
    if (paymentMethod === 'card' && (cardNumber.length < 16 || !cardExpiry || !cardCvv)) { toast.error('Please enter valid card details'); return; }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setBookingStep('confirmed');

      const days = liveBudget.days;
      const booking = {
        id: `custom-${Date.now()}`,
        packageId: 'custom',
        packageName: `${source} → ${destination}`,
        destination,
        duration: `${days}N/${days + 1}D`,
        image: selectedHotel!.image,
        price: liveBudget.totalEstimated,
        travelDate: travelPlan?.input.startDate || new Date().toISOString(),
        travelers: 1,
        bookedAt: new Date().toISOString(),
        status: 'upcoming',
      };
      const existing = JSON.parse(localStorage.getItem('tacttrip_package_bookings') || '[]');
      existing.push(booking);
      localStorage.setItem('tacttrip_package_bookings', JSON.stringify(existing));

      toast.success('Payment successful! Booking confirmed.');
    }, 2500);
  };

  if (isLoading || !travelPlan) return <LoadingState />;

  const displayTransport = realTimeTransport.length > 0 ? processTransportOptions(realTimeTransport) : travelPlan.transport;
  const displayHotels = realTimeHotels.length > 0 ? processHotels(realTimeHotels) : travelPlan.hotels;
  const displayWeather = realTimeWeather || travelPlan.weather;
  const displayAttractions = realTimeAttractions.length > 0 ? realTimeAttractions : travelPlan.attractions;
  const displayFood = realTimeFood.length > 0 ? realTimeFood : travelPlan.food;
  const displayShopping = realTimeShopping.length > 0 ? realTimeShopping : travelPlan.shopping;
  const { input, budget: budgetBreakdown } = travelPlan;
  const days = calculateDays();

  // Confirmed state
  if (bookingStep === 'confirmed') {
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
                Your trip from {source} to {destination} has been booked successfully.
              </p>
              <p className="text-lg font-semibold text-primary mb-8">
                Total Paid: ₹{liveBudget.totalEstimated.toLocaleString()}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate('/bookings')}>View My Bookings</Button>
                <Button className="gradient-hero" onClick={handleNewPlan}>Plan Another Trip</Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Summary + Payment view
  if (bookingStep === 'summary' || bookingStep === 'payment') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mb-8 text-sm">
              <Badge variant="secondary" className="bg-primary/10 text-primary">✓ Plan Generated</Badge>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <Badge variant="secondary" className="bg-primary/10 text-primary">✓ Selections Made</Badge>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <Badge className={bookingStep === 'payment' ? 'bg-primary/10 text-primary' : 'bg-primary text-primary-foreground'}>
                {bookingStep === 'payment' ? '✓ Summary' : '3. Summary'}
              </Badge>
              {bookingStep === 'payment' && (
                <>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Badge className="bg-primary text-primary-foreground">4. Payment</Badge>
                </>
              )}
            </div>

            <Button variant="ghost" onClick={() => setBookingStep('explore')} className="mb-4 text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Plan
            </Button>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <h1 className="text-2xl font-bold text-foreground">Booking Summary</h1>

                {/* Transport Details */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Plane className="w-5 h-5" /> Transport Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Route</span><span className="font-medium text-foreground">{source} → {destination}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Operator</span><span className="font-medium text-foreground">{selectedTransport!.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium text-foreground capitalize">{selectedTransport!.type}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium text-foreground">{selectedTransport!.departureTime} → {selectedTransport!.arrivalTime}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium text-foreground">{selectedTransport!.duration}</span></div>
                    <Separator />
                    <div className="flex justify-between text-lg"><span className="font-semibold text-foreground">Subtotal</span><span className="font-bold text-primary">₹{liveBudget.transportCost.toLocaleString()}</span></div>
                  </CardContent>
                </Card>

                {/* Hotel Details */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Hotel className="w-5 h-5" /> Hotel Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-4">
                      <img src={selectedHotel!.image} alt={selectedHotel!.name} className="w-24 h-24 rounded-lg object-cover" />
                      <div>
                        <h3 className="font-semibold text-foreground">{selectedHotel!.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedHotel!.distance}</p>
                        <Badge variant="secondary" className="mt-1">⭐ {selectedHotel!.rating.toFixed(1)}</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium text-foreground">{days} night{days > 1 ? 's' : ''}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span className="font-medium text-foreground">₹{selectedHotel!.pricePerNight.toLocaleString()}/night</span></div>
                    <Separator />
                    <div className="flex justify-between text-lg"><span className="font-semibold text-foreground">Subtotal</span><span className="font-bold text-primary">₹{liveBudget.hotelCost.toLocaleString()}</span></div>
                  </CardContent>
                </Card>

                {/* Payment Section */}
                {bookingStep === 'summary' ? (
                  <Button className="w-full gradient-hero h-12 text-lg" onClick={handleProceedToPayment}>
                    Proceed to Payment <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="w-5 h-5" /> Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        {([
                          { key: 'upi' as const, label: 'UPI', icon: Smartphone, desc: 'GPay, PhonePe' },
                          { key: 'card' as const, label: 'Card', icon: CreditCard, desc: 'Credit / Debit' },
                          { key: 'netbanking' as const, label: 'Net Banking', icon: Building2, desc: 'Bank Transfer' },
                        ]).map(({ key, label, icon: Icon, desc }) => (
                          <button
                            key={key}
                            onClick={() => setPaymentMethod(key)}
                            className={`p-4 rounded-xl border-2 transition-all text-center ${
                              paymentMethod === key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
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
                          <Input placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="h-11" />
                        </div>
                      )}
                      {paymentMethod === 'card' && (
                        <div className="space-y-3">
                          <div className="space-y-2"><Label>Card Number</Label><Input placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} className="h-11" /></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2"><Label>Expiry</Label><Input placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))} className="h-11" /></div>
                            <div className="space-y-2"><Label>CVV</Label><Input type="password" placeholder="***" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} className="h-11" /></div>
                          </div>
                        </div>
                      )}
                      {paymentMethod === 'netbanking' && (
                        <div className="p-4 rounded-lg bg-secondary/50 text-center">
                          <p className="text-sm text-muted-foreground">You will be redirected to your bank's secure portal.</p>
                        </div>
                      )}

                      <Button className="w-full gradient-hero h-12 text-lg" onClick={handlePayment} disabled={isProcessing}>
                        {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</> : <>Pay ₹{liveBudget.totalEstimated.toLocaleString()}</>}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right: Live Budget */}
              <div className="lg:col-span-2">
                <Card className="border-border/50 sticky top-24">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <PiggyBank className="w-5 h-5 text-primary" /> Real-Time Budget
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Transport</span><span className="font-medium text-foreground">₹{liveBudget.transportCost.toLocaleString()}</span></div>
                      <Progress value={(liveBudget.transportCost / Math.max(liveBudget.totalEstimated, 1)) * 100} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Hotel ({days}N)</span><span className="font-medium text-foreground">₹{liveBudget.hotelCost.toLocaleString()}</span></div>
                      <Progress value={(liveBudget.hotelCost / Math.max(liveBudget.totalEstimated, 1)) * 100} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Daily Expenses</span><span className="font-medium text-foreground">₹{liveBudget.dailyExpense.toLocaleString()}</span></div>
                      <Progress value={(liveBudget.dailyExpense / Math.max(liveBudget.totalEstimated, 1)) * 100} className="h-2" />
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg"><span className="font-semibold text-foreground">Total</span><span className="font-bold text-foreground">₹{liveBudget.totalEstimated.toLocaleString()}</span></div>
                    <div className={`p-3 rounded-lg ${liveBudget.isWithinBudget ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`flex items-center gap-1 text-sm font-medium ${liveBudget.isWithinBudget ? 'text-green-600' : 'text-destructive'}`}>
                          {liveBudget.isWithinBudget ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                          {liveBudget.isWithinBudget ? 'Under Budget' : 'Over Budget'}
                        </span>
                        <span className={`font-bold ${liveBudget.isWithinBudget ? 'text-green-600' : 'text-destructive'}`}>
                          ₹{Math.abs(liveBudget.remaining).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Budget Utilization</span><span className="font-medium">{liveBudget.utilizationPercent.toFixed(0)}%</span></div>
                      <Progress value={Math.min(liveBudget.utilizationPercent, 100)} className={`h-3 ${!liveBudget.isWithinBudget ? '[&>div]:bg-destructive' : ''}`} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Main explore view with selectable cards
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <Button variant="ghost" onClick={() => navigate('/plan')} className="mb-2 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Modify Search
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Your Trip: {input.source} → {input.destination}
              </h1>
              <p className="text-muted-foreground">
                Budget: ₹{input.budget.toLocaleString()} • {days} day{days > 1 ? 's' : ''} • {input.preference.charAt(0).toUpperCase() + input.preference.slice(1)} mode
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleRefreshAll} disabled={isRealTimeLoading || isTransportLoading || isHotelsLoading}>
                {(isRealTimeLoading || isTransportLoading || isHotelsLoading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Refresh
              </Button>
              <Button onClick={handleNewPlan} size="sm" variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" /> New Plan
              </Button>
            </div>
          </div>

          {/* Selection prompt */}
          {(selectedTransport || selectedHotel) && (
            <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={selectedTransport ? "default" : "secondary"} className={selectedTransport ? "bg-primary" : ""}>
                  {selectedTransport ? `✓ ${selectedTransport.name}` : 'Select Transport'}
                </Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant={selectedHotel ? "default" : "secondary"} className={selectedHotel ? "bg-primary" : ""}>
                  {selectedHotel ? `✓ ${selectedHotel.name}` : 'Select Hotel'}
                </Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="secondary">Payment</Badge>
              </div>
              {selectedTransport && selectedHotel && (
                <Button className="gradient-hero" onClick={handleProceedToSummary}>
                  Proceed to Book <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-8">
              {/* Transport */}
              <section className="animate-slide-up">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10"><Plane className="w-5 h-5 text-primary" /></div>
                  Select Transport
                </h2>
                <div className="space-y-4">
                  {isTransportLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Finding best routes...</span></div>
                  ) : displayTransport.length > 0 ? (
                    displayTransport.map((option) => (
                      <TransportCard 
                        key={option.id} 
                        option={option} 
                        onSelect={setSelectedTransport}
                        isSelected={selectedTransport?.id === option.id}
                      />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No transport options available</p>
                  )}
                </div>
              </section>

              {/* Hotels */}
              <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-purple-500/10"><Building className="w-5 h-5 text-purple-500" /></div>
                  Select Hotel
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isHotelsLoading ? (
                    <div className="col-span-2 flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Finding best hotels...</span></div>
                  ) : displayHotels.length > 0 ? (
                    displayHotels.map((hotel) => (
                      <HotelCard 
                        key={hotel.id} 
                        hotel={hotel} 
                        nights={days} 
                        onSelect={setSelectedHotel}
                        isSelected={selectedHotel?.id === hotel.id}
                      />
                    ))
                  ) : (
                    <p className="col-span-2 text-muted-foreground text-center py-4">No hotels found</p>
                  )}
                </div>
              </section>

              {/* Experiences */}
              <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <ExperienceSection
                  attractions={displayAttractions}
                  food={displayFood}
                  shopping={displayShopping}
                  destination={input.destination}
                  nearbyPlaces={realTimeNearbyPlaces}
                  activities={realTimeActivities}
                  monuments={realTimeMonuments}
                />
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <div className="relative">
                  {isRealTimeLoading && (
                    <div className="absolute inset-0 bg-background/50 rounded-xl flex items-center justify-center z-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  )}
                  <WeatherWidget weather={displayWeather} destination={input.destination} />
                </div>
              </div>

              {/* Live Budget based on selections */}
              <div className="animate-slide-up sticky top-24" style={{ animationDelay: '0.2s' }}>
                {selectedTransport || selectedHotel ? (
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <PiggyBank className="w-5 h-5 text-primary" /> Live Trip Cost
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Transport</span><span className="font-medium">₹{liveBudget.transportCost.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Hotel ({days}N)</span><span className="font-medium">₹{liveBudget.hotelCost.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Daily Expenses</span><span className="font-medium">₹{liveBudget.dailyExpense.toLocaleString()}</span></div>
                      <Separator />
                      <div className="flex justify-between"><span className="font-semibold text-foreground">Total</span><span className="font-bold text-foreground">₹{liveBudget.totalEstimated.toLocaleString()}</span></div>
                      <div className={`p-3 rounded-lg ${liveBudget.isWithinBudget ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`flex items-center gap-1 text-sm font-medium ${liveBudget.isWithinBudget ? 'text-green-600' : 'text-destructive'}`}>
                            {liveBudget.isWithinBudget ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                            {liveBudget.isWithinBudget ? 'Under Budget' : 'Over Budget'}
                          </span>
                          <span className={`font-bold ${liveBudget.isWithinBudget ? 'text-green-600' : 'text-destructive'}`}>₹{Math.abs(liveBudget.remaining).toLocaleString()}</span>
                        </div>
                      </div>
                      {selectedTransport && selectedHotel && (
                        <Button className="w-full gradient-hero" onClick={handleProceedToSummary}>
                          Proceed to Book <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <BudgetSummary budget={budgetBreakdown} totalBudget={input.budget} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
