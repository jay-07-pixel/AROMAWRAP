import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/services/orderService";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, CreditCard, Truck, MapPin, Phone, Mail, User, Lock, ShieldCheck, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPincodeFetching, setIsPincodeFetching] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Fetch city and state based on pincode
  const fetchLocationByPincode = async (pincode: string) => {
    // Only fetch if pincode is 6 digits
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return;
    }

    setIsPincodeFetching(true);

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        
        setFormData((prev) => ({
          ...prev,
          city: postOffice.District || prev.city,
          state: postOffice.State || prev.state,
        }));

        toast({
          title: "Location Found! 📍",
          description: `${postOffice.District}, ${postOffice.State}`,
        });
      } else {
        toast({
          title: "Invalid Pincode",
          description: "Could not find location for this pincode",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching pincode data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch location. Please enter manually.",
        variant: "destructive",
      });
    } finally {
      setIsPincodeFetching(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value;
    
    // Only allow numbers and max 6 digits
    if (pincode && !/^\d{0,6}$/.test(pincode)) {
      return;
    }

    setFormData({
      ...formData,
      pincode: pincode,
    });

    // Fetch location when pincode is 6 digits
    if (pincode.length === 6) {
      fetchLocationByPincode(pincode);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place an order",
        variant: "destructive",
      });
      navigate("/account");
      return;
    }
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate shipping cost
      const shippingCost = totalPrice >= 499 ? 0 : 49;
      const finalTotal = totalPrice + shippingCost;

      // Map cart items to order items format
      const orderItems = items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      // Create order object for Firestore
      const orderData = {
        userId: user.uid,
        items: orderItems,
        total: finalTotal,
        status: 'pending' as const,
        shippingAddress: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        paymentMethod: paymentMethod === "cod" ? 'cod' as const : 'online' as const,
        paymentStatus: paymentMethod === "cod" ? 'pending' as const : 'pending' as const,
      };

      // Save order to Firestore
      const orderId = await createOrder(orderData);

      // Clear cart silently after successful order (don't show "Cart cleared" toast)
      await clearCart(true);
      
      toast({
        title: "Order Placed Successfully! 🎉",
        description: `Your order #${orderId} of ₹${finalTotal.toFixed(2)} has been confirmed. We'll send you a confirmation email shortly.`,
      });
      
      setIsProcessing(false);
      navigate("/account");
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // If cart is empty, redirect to home
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mb-6 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some products to continue with checkout</p>
          <Button onClick={() => navigate("/")} size="lg">
            Continue Shopping
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // If user is not logged in, show message
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
          <Lock className="h-24 w-24 text-muted-foreground mb-6 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-6">Please login to proceed with checkout</p>
          <Button onClick={() => navigate("/account")} size="lg">
            Go to Login
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const shippingCost = totalPrice >= 499 ? 0 : 49;
  const finalTotal = totalPrice + shippingCost;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="flex-1 py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#DC143C] mb-2">Checkout</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Complete your order and enjoy natural fragrances</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Shipping Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="shadow-lg border-2 hover:border-[#C75D5D] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-[#DC143C]" />
                      Shipping Information
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Enter your delivery details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePlaceOrder} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-[#DC143C]" />
                            Full Name *
                          </Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            className="border-2 focus:border-[#A97142]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-[#DC143C]" />
                            Phone Number *
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="border-2 focus:border-[#A97142]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-[#DC143C]" />
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="border-2 focus:border-[#A97142]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#DC143C]" />
                          Address *
                        </Label>
                        <Input
                          id="address"
                          name="address"
                          placeholder="House No., Street Name"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="border-2 focus:border-[#A97142]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pincode">Pincode *</Label>
                          <div className="relative">
                            <Input
                              id="pincode"
                              name="pincode"
                              placeholder="400001"
                              value={formData.pincode}
                              onChange={handlePincodeChange}
                              required
                              maxLength={6}
                              className="border-2 focus:border-[#A97142]"
                            />
                            {isPincodeFetching && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-[#A97142] border-t-transparent rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">City & State auto-fill</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            name="city"
                            placeholder="Auto-filled from pincode"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="border-2 focus:border-[#A97142] bg-muted/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            name="state"
                            placeholder="Auto-filled from pincode"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className="border-2 focus:border-[#A97142] bg-muted/30"
                          />
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="shadow-lg border-2 hover:border-[#C75D5D] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-[#DC143C]" />
                      Payment Method
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Select your preferred payment method</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                      <div className="flex items-center space-x-3 border-2 rounded-lg p-4 hover:border-[#C75D5D] transition-all cursor-pointer">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Package className="h-5 w-5 text-[#DC143C]" />
                          <div>
                            <p className="font-semibold">Cash on Delivery</p>
                            <p className="text-sm text-muted-foreground">Pay when you receive</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 border-2 rounded-lg p-4 hover:border-[#C75D5D] transition-all cursor-pointer">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Lock className="h-5 w-5 text-[#DC143C]" />
                          <div>
                            <p className="font-semibold">Online Payment</p>
                            <p className="text-sm text-muted-foreground">Credit/Debit Card, UPI, Net Banking</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    <div className="mt-6 p-4 bg-[#FFF1F1] rounded-lg border border-[#C75D5D]">
                      <div className="flex items-center gap-2 text-sm">
                        <ShieldCheck className="h-5 w-5 text-[#DC143C]" />
                        <p className="text-muted-foreground">
                          Your payment information is secure and encrypted
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="lg:sticky lg:top-24"
              >
                <Card className="shadow-xl border-2 border-[#C75D5D]">
                  <CardHeader className="bg-gradient-to-r from-[#FAF3ED] to-white">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-[#DC143C]" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    {/* Cart Items */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            <p className="text-[#DC143C] font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                        <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        {shippingCost === 0 ? (
                          <span className="font-medium text-green-600">FREE</span>
                        ) : (
                          <span className="font-medium">₹{shippingCost.toFixed(2)}</span>
                        )}
                      </div>
                      {totalPrice < 499 && (
                        <p className="text-xs text-[#DC143C] bg-[#FFF1F1] p-2 rounded">
                          Add ₹{(499 - totalPrice).toFixed(2)} more for FREE shipping!
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold text-[#DC143C]">₹{finalTotal.toFixed(2)}</span>
                    </div>

                    {/* Place Order Button */}
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      size="lg"
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span>
                          Processing...
                        </span>
                      ) : (
                        `Place Order - ₹${finalTotal.toFixed(2)}`
                      )}
                    </Button>

                    {/* Security Badge */}
                    <div className="text-center pt-2">
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Lock className="h-3 w-3" />
                        Secure checkout
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12"
          >
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="h-12 w-12 bg-[#FFF1F1] rounded-full flex items-center justify-center">
                <Truck className="h-6 w-6 text-[#DC143C]" />
              </div>
              <div>
                <p className="font-semibold">Free Shipping</p>
                <p className="text-sm text-muted-foreground">On orders above ₹499</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="h-12 w-12 bg-[#FFF1F1] rounded-full flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-[#DC143C]" />
              </div>
              <div>
                <p className="font-semibold">Secure Payment</p>
                <p className="text-sm text-muted-foreground">100% secure transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="h-12 w-12 bg-[#FFF1F1] rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-[#DC143C]" />
              </div>
              <div>
                <p className="font-semibold">Easy Returns</p>
                <p className="text-sm text-muted-foreground">7-day return policy</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;

