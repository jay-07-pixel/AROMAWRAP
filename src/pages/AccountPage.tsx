import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Package, Heart, Clock, LogOut, Mail, Lock, MapPin, Phone, CreditCard, Truck, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useWishlist } from "@/context/WishlistContext";
import { motion } from "framer-motion";
import { OrderSkeleton } from "@/components/OrderSkeleton";
import { useAuth } from "@/context/AuthContext";
import { signIn, signUp, logout, updateUserProfile, addAddress } from "@/services/authService";
import { getUserOrders } from "@/services/orderService";

const AccountPage = () => {
  const navigate = useNavigate();
  const { items: wishlistItems } = useWishlist();
  const { user, userProfile, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Login/Signup form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Profile form states
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address form states
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressPincode, setAddressPincode] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  useEffect(() => {
    // Load user orders when logged in
    const loadOrders = async () => {
      if (user && userProfile) {
        setIsLoadingOrders(true);
        try {
          const userOrders = await getUserOrders(user.uid);
          setOrders(userOrders);
          } catch (error) {
          console.error("Error loading orders:", error);
        } finally {
          setIsLoadingOrders(false);
        }
      } else {
        setIsLoadingOrders(false);
      }
    };

    if (!loading) {
      loadOrders();
    }
  }, [user, userProfile, loading]);

  // Populate form fields when user profile loads
  useEffect(() => {
    if (userProfile) {
      setProfileName(userProfile.displayName || "");
      setProfilePhone(userProfile.phone || "");
      
      // Load default address if exists
      if (userProfile.addresses && userProfile.addresses.length > 0) {
        const defaultAddress = userProfile.addresses.find(addr => addr.isDefault) || userProfile.addresses[0];
        setAddressStreet(defaultAddress.address || "");
        setAddressCity(defaultAddress.city || "");
        setAddressState(defaultAddress.state || "");
        setAddressPincode(defaultAddress.pincode || "");
      }
    }
  }, [userProfile]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);

    try {
      // Sign in with Firebase
      await signIn(loginEmail, loginPassword);
      
      toast({
        title: "Login Successful! 🎉",
        description: "Welcome back to AromaWrap",
      });

      // Check if admin (after successful login)
    if (loginEmail.toLowerCase() === "admin@gmail.com") {
      toast({
        title: "Welcome Admin! 👑",
        description: "Redirecting to admin dashboard...",
      });
      
      setTimeout(() => {
        navigate("/admin");
      }, 1000);
      }
    } catch (error: any) {
      console.error("Login error:", error);
    toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
    });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);

    try {
      // Create account with Firebase and save to Firestore
      await signUp(signupEmail, signupPassword, signupName);
    
    toast({
      title: "Account Created! 🎉",
      description: "Welcome to AromaWrap",
    });

      // Clear form
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirmPassword("");
    } catch (error: any) {
      console.error("Signup error:", error);
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please login instead.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Use at least 6 characters.";
      }
      
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });

      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!profileName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    setIsSavingProfile(true);

    try {
      await updateUserProfile(user.uid, {
        displayName: profileName.trim(),
        phone: profilePhone.trim() || undefined,
      });

      toast({
        title: "Profile Updated! ✅",
        description: "Your personal information has been saved",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;

    if (!addressStreet.trim() || !addressCity.trim() || !addressState.trim() || !addressPincode.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all address fields",
        variant: "destructive",
      });
      return;
    }

    setIsSavingAddress(true);

    try {
      const newAddress = {
        name: profileName || userProfile?.displayName || user.email?.split("@")[0] || "",
        phone: profilePhone || "",
        address: addressStreet.trim(),
        city: addressCity.trim(),
        state: addressState.trim(),
        pincode: addressPincode.trim(),
        isDefault: true,
      };

      await addAddress(user.uid, newAddress);

      toast({
        title: "Address Saved! ✅",
        description: "Your shipping address has been updated",
      });
    } catch (error) {
      console.error("Error saving address:", error);
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If not logged in, show login/signup form
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-4xl">
            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-[#DC143C]">Welcome Back!</CardTitle>
                    <CardDescription>
                      Login to your account to continue shopping
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-[#DC143C]" />
                          Email Address
                        </Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          className="border-2 focus:border-[#DC143C]"
                        />
                        <p className="text-xs text-muted-foreground">
                          Use <span className="font-semibold text-[#DC143C]">admin@gmail.com</span> for admin access
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-[#DC143C]" />
                          Password
                        </Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="border-2 focus:border-[#DC143C]"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                      <Button 
                        type="submit" 
                        className="w-full bg-[#DC143C] hover:bg-[#801030]"
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? "Logging in..." : "Login"}
                      </Button>
                      <p className="text-sm text-center text-muted-foreground">
                        Don't have an account?{" "}
                        <button type="button" className="text-[#DC143C] font-semibold hover:underline">
                          Sign up now
                        </button>
                      </p>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-[#DC143C]">Create Account</CardTitle>
                    <CardDescription>
                      Join us and start shopping for natural fragrances
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#DC143C]" />
                          Full Name
                        </Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                          className="border-2 focus:border-[#DC143C]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-[#DC143C]" />
                          Email Address
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                          className="border-2 focus:border-[#DC143C]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-[#DC143C]" />
                          Password
                        </Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password (min 6 characters)"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={6}
                          className="border-2 focus:border-[#DC143C]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm-password" className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-[#DC143C]" />
                          Confirm Password
                        </Label>
                        <Input
                          id="signup-confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          className="border-2 focus:border-[#DC143C]"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                      <Button 
                        type="submit" 
                        className="w-full bg-[#DC143C] hover:bg-[#801030]"
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? "Creating Account..." : "Create Account"}
                      </Button>
                      <p className="text-sm text-center text-muted-foreground">
                        Already have an account?{" "}
                        <button type="button" className="text-[#DC143C] font-semibold hover:underline">
                          Login here
                        </button>
                      </p>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // If logged in, show account page
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Account Header */}
      <section className="bg-background py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#DC143C]/20 to-[#DC143C]/30 flex items-center justify-center">
                <User className="h-10 w-10 text-[#DC143C]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#DC143C] mb-1">
                  Welcome, {userProfile?.displayName || user?.email?.split("@")[0]}!
                </h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 border-[#DC143C] text-[#DC143C] hover:bg-[#DC143C] hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </section>

      {/* Account Content */}
      <section className="flex-1 py-8 bg-background">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Wishlist
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Enter your name" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Enter your email" 
                        value={user?.email || ""} 
                        disabled 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        placeholder="Enter your phone number"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="w-full bg-[#DC143C] hover:bg-[#801030]"
                    >
                      {isSavingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Address Information</CardTitle>
                    <CardDescription>Manage your shipping addresses</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input 
                        id="address" 
                        placeholder="Enter your address"
                        value={addressStreet}
                        onChange={(e) => setAddressStreet(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        placeholder="Enter your city"
                        value={addressCity}
                        onChange={(e) => setAddressCity(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input 
                          id="state" 
                          placeholder="Enter state"
                          value={addressState}
                          onChange={(e) => setAddressState(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input 
                          id="pincode" 
                          placeholder="Enter pincode"
                          value={addressPincode}
                          onChange={(e) => setAddressPincode(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleSaveAddress}
                      disabled={isSavingAddress}
                      className="w-full bg-[#DC143C] hover:bg-[#801030]"
                    >
                      {isSavingAddress ? "Saving..." : "Update Address"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              {isLoadingOrders ? (
                <div className="space-y-6">
                  <OrderSkeleton />
                  <OrderSkeleton />
                </div>
              ) : orders.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Orders</CardTitle>
                    <CardDescription>View and track your orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                      <p>When you make your first order, it will appear here.</p>
                      <Button
                        onClick={() => navigate("/")}
                        className="mt-6 bg-[#DC143C] hover:bg-[#801030]"
                      >
                        Start Shopping
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden border-2 hover:border-[#DC143C] transition-colors">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-[#DC143C]" />
                                Order {order.id}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(order.date).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </CardDescription>
                            </div>
                            <Badge
                              className={`px-4 py-2 ${
                                order.status === "Delivered"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : order.status === "Processing"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                              }`}
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          {/* Order Items */}
                          <div className="space-y-4 mb-6">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase">
                              Order Items ({order.items.length})
                            </h4>
                            <div className="grid gap-4">
                              {order.items.map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-16 w-16 object-cover rounded"
                                  />
                                  <div className="flex-1">
                                    <h5 className="font-medium text-sm line-clamp-2">
                                      {item.name}
                                    </h5>
                                    <p className="text-sm text-muted-foreground">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-[#DC143C]">
                                      ₹{item.price * item.quantity}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator className="my-6" />

                          {/* Order Summary */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
                                Shipping Address
                              </h4>
                              <div className="space-y-2 text-sm">
                                <p className="font-medium">{order.shippingAddress.fullName}</p>
                                <p className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 mt-0.5 text-[#DC143C]" />
                                  <span>
                                    {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                                    {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                  </span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-[#DC143C]" />
                                  {order.shippingAddress.phone}
                                </p>
                                <p className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-[#DC143C]" />
                                  {order.shippingAddress.email}
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
                                Order Summary
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span className="font-medium">₹{order.totalPrice}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Shipping:</span>
                                  <span className="font-medium">
                                    {order.shippingCost === 0 ? (
                                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        FREE
                                      </Badge>
                                    ) : (
                                      `₹${order.shippingCost}`
                                    )}
                                  </span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between text-lg font-bold">
                                  <span>Total:</span>
                                  <span className="text-[#DC143C]">₹{order.finalTotal}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-4 p-2 bg-muted/50 rounded">
                                  <CreditCard className="h-4 w-4 text-[#DC143C]" />
                                  <span className="text-xs font-medium">{order.paymentMethod}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50 flex gap-3">
                          <Button variant="outline" className="flex-1">
                            <Truck className="h-4 w-4 mr-2" />
                            Track Order
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-[#DC143C] text-[#DC143C] hover:bg-[#DC143C] hover:text-white"
                          >
                            Reorder
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist">
              {wishlistItems.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Wishlist</CardTitle>
                    <CardDescription>Products you've saved for later</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                      <p>Save items you like to your wishlist and they will appear here.</p>
                      <Button
                        onClick={() => navigate("/")}
                        className="mt-6 bg-[#DC143C] hover:bg-[#801030]"
                      >
                        Browse Products
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Your Wishlist</span>
                      <Badge variant="secondary">{wishlistItems.length} items</Badge>
                    </CardTitle>
                    <CardDescription>Products you've saved for later</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlistItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="group bg-white rounded-lg border-2 hover:border-[#DC143C] transition-all overflow-hidden"
                        >
                          <div className="relative aspect-square">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            {item.badge && (
                              <Badge className="absolute top-2 right-2 bg-[#DC143C]">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg font-bold text-[#DC143C]">
                                ₹{item.price}
                              </span>
                              {item.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{item.originalPrice}
                                </span>
                              )}
                            </div>
                            <Button
                              onClick={() => navigate(`/product/${item.id}`)}
                              className="w-full bg-[#DC143C] hover:bg-[#801030]"
                              size="sm"
                            >
                              View Product
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase History</CardTitle>
                  <CardDescription>View your past purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No purchase history</h3>
                    <p>Your purchase history will appear here once you complete an order.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AccountPage;
