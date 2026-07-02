import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Check,
  X,
  Plus,
  Download,
  Filter,
  Search,
  Upload,
  Image as ImageIcon,
  MapPin,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { isAdminUser } from "@/services/authService";
import { getAllOrders, getOrderById, updateOrderStatus, updateOnlinePaymentReview, Order } from "@/services/orderService";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
  type Product as ApiProduct,
} from "@/services/productService";
import { uploadProductImage } from "@/services/uploadService";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sold: number;
  status: string;
  description?: string;
  image: string;
  badge?: string;
}

function stockStatus(stock: number): string {
  if (stock > 20) return "In Stock";
  if (stock > 0) return "Low Stock";
  return "Out of Stock";
}

function mapProductToAdminRow(product: ApiProduct): Product {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice,
    stock: product.stock,
    sold: 0,
    status: stockStatus(product.stock),
    description: product.description,
    image: product.image,
    badge: product.badge,
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    originalPrice: "",
    stock: "",
    description: "",
    badge: "",
  });

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    originalPrice: "",
    stock: "",
    description: "",
    badge: "",
  });

  const [stats, setStats] = useState([
    {
      title: "Total Revenue",
      value: "₹0",
      change: "0%",
      icon: IndianRupee,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: "0",
      change: "0%",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Products",
      value: "0",
      change: "0",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Customers",
      value: "0",
      change: "0%",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false);
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<string>("");
  const [upiRejectMode, setUpiRejectMode] = useState(false);
  const [upiRejectReason, setUpiRejectReason] = useState("");
  const [upiReviewLoading, setUpiReviewLoading] = useState(false);

  const isAdmin = !!user && isAdminUser(user.email, userProfile);

  useEffect(() => {
    setUpiRejectMode(false);
    setUpiRejectReason("");
  }, [selectedOrder?.id]);

  useEffect(() => {
    if (!loading) {
      const allowed = isAdminUser(user?.email, userProfile);
      if (!user || !allowed) {
        navigate("/account");
      }
    }
  }, [user, userProfile, loading, navigate]);

  useEffect(() => {
    if (loading || !isAdmin) return;

    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const apiProducts = await getAllProducts();
        setProducts(apiProducts.map(mapProductToAdminRow));
      } catch (error) {
        console.error("Error loading products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, [loading, isAdmin]);

  useEffect(() => {
    if (loading || !isAdmin) {
      if (!loading && !isAdmin) {
        setIsLoadingOrders(false);
      }
      return;
    }

    const loadOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const orders = await getAllOrders();

        const formattedOrders = orders.map((order: Order) => {
          const firstItem = order.items[0];
          const productName =
            order.items.length > 1
              ? `${firstItem.name} + ${order.items.length - 1} more`
              : firstItem.name;

          return {
            id: order.id || `ORD-${Date.now()}`,
            customer: order.shippingAddress.name,
            email: order.shippingAddress.email || order.shippingAddress.phone,
            product: productName,
            amount: order.total,
            status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
            date:
              order.createdAt?.toDate().toISOString().split("T")[0] ||
              new Date().toISOString().split("T")[0],
            orderData: order,
          };
        });

        setRecentOrders(formattedOrders);

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;
        const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

        setStats([
          {
            title: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString("en-IN")}`,
            change: "+0%",
            icon: IndianRupee,
            color: "text-green-600",
            bgColor: "bg-green-50",
          },
          {
            title: "Total Orders",
            value: totalOrders.toString(),
            change: "+0%",
            icon: ShoppingCart,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
          },
          {
            title: "Total Products",
            value: products.length.toString(),
            change: "0",
            icon: Package,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
          },
          {
            title: "Delivered Orders",
            value: deliveredOrders.toString(),
            change: "+0%",
            icon: Users,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
          },
        ]);
      } catch (error) {
        console.error("Error loading orders:", error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOrders(false);
      }
    };

    loadOrders();
  }, [loading, isAdmin, products.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const syncOrderInList = (fresh: Order) => {
    setRecentOrders((prev) =>
      prev.map((row) => {
        const rid = row.orderData?.id ?? row.id;
        if (rid === fresh.id) {
          return {
            ...row,
            id: fresh.id,
            orderData: fresh,
          };
        }
        return row;
      })
    );
  };

  const handleApproveUpi = async () => {
    if (!selectedOrder?.id) return;
    setUpiReviewLoading(true);
    try {
      await updateOnlinePaymentReview(selectedOrder.id, "approve");
      const fresh = await getOrderById(selectedOrder.id);
      if (fresh) {
        setSelectedOrder(fresh);
        syncOrderInList(fresh);
      }
      toast({
        title: "Payment approved",
        description: "The customer will see that their order is confirmed.",
      });
      setUpiRejectMode(false);
    } catch (e: any) {
      toast({
        title: "Could not update",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpiReviewLoading(false);
    }
  };

  const handleSubmitUpiReject = async () => {
    if (!selectedOrder?.id) return;
    if (!upiRejectReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please enter a message for the customer.",
        variant: "destructive",
      });
      return;
    }
    setUpiReviewLoading(true);
    try {
      await updateOnlinePaymentReview(selectedOrder.id, "reject", upiRejectReason);
      const fresh = await getOrderById(selectedOrder.id);
      if (fresh) {
        setSelectedOrder(fresh);
        syncOrderInList(fresh);
      }
      toast({
        title: "Rejection saved",
        description: "The customer can read your message in their orders list.",
      });
      setUpiRejectMode(false);
      setUpiRejectReason("");
    } catch (e: any) {
      toast({
        title: "Could not update",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpiReviewLoading(false);
    }
  };

  const reloadProducts = async () => {
    const apiProducts = await getAllProducts();
    setProducts(apiProducts.map(mapProductToAdminRow));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      stock: String(product.stock),
      description: product.description || "",
      badge: product.badge || "",
    });
    setEditImagePreview(product.image);
    setEditImageFile(null);
    setIsEditProductOpen(true);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price || !imageFile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and upload an image",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(newProduct.price);
    const originalPrice = newProduct.originalPrice
      ? parseFloat(newProduct.originalPrice)
      : undefined;
    const stock = parseInt(newProduct.stock) || 0;

    setIsSavingProduct(true);
    try {
      const imageUrl = await uploadProductImage(imageFile);
      await addProduct({
        name: newProduct.name,
        category: newProduct.category,
        price,
        originalPrice,
        stock,
        description: newProduct.description || "",
        image: imageUrl,
        badge: newProduct.badge || undefined,
        features: [],
        specifications: {},
      });
      await reloadProducts();

      toast({
        title: "Success! 🎉",
        description: `${newProduct.name} has been added successfully`,
      });

      setNewProduct({
        name: "",
        category: "",
        price: "",
        originalPrice: "",
        stock: "",
        description: "",
        badge: "",
      });
      setImagePreview("");
      setImageFile(null);
      setIsAddProductOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !editForm.name || !editForm.category || !editForm.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(editForm.price);
    const originalPrice = editForm.originalPrice
      ? parseFloat(editForm.originalPrice)
      : undefined;
    const stock = parseInt(editForm.stock) || 0;

    setIsSavingProduct(true);
    try {
      const updates: Partial<ApiProduct> = {
        name: editForm.name,
        category: editForm.category,
        price,
        originalPrice,
        stock,
        description: editForm.description || "",
        badge: editForm.badge || undefined,
      };

      if (editImageFile) {
        updates.image = await uploadProductImage(editImageFile);
      }

      await updateProduct(editingProduct.id, updates);
      await reloadProducts();

      toast({
        title: "Product Updated",
        description: `${editForm.name} has been updated successfully`,
      });

      setIsEditProductOpen(false);
      setEditingProduct(null);
      setEditImagePreview("");
      setEditImageFile(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast({
        title: "Product Deleted",
        description: "Product has been removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      Delivered: "bg-green-100 text-green-800",
      Processing: "bg-blue-100 text-blue-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Cancelled: "bg-red-100 text-red-800",
      "In Stock": "bg-green-100 text-green-800",
      "Low Stock": "bg-yellow-100 text-yellow-800",
      "Out of Stock": "bg-red-100 text-red-800",
    };

    return (
      <Badge className={`${statusColors[status]} border-0`}>
        {status}
      </Badge>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    navigate("/account");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Admin Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#DC143C] flex items-center gap-3">
                <LayoutDashboard className="h-8 w-8" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Welcome back, Admin! Manage your store from here.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/")}>
                View Store
              </Button>
              <Button onClick={handleLogout} className="bg-[#DC143C] hover:bg-[#801030]">
                Logout
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                      {stat.change}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:w-auto lg:inline-grid mb-6">
              <TabsTrigger value="overview" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                Products
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-[#DC143C]" />
                      Recent Orders
                    </CardTitle>
                    <CardDescription>Latest customer orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoadingOrders ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-muted-foreground">Loading orders...</p>
                        </div>
                      ) : recentOrders.length > 0 ? (
                        recentOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{order.customer}</p>
                            <p className="text-xs text-muted-foreground">{order.product}</p>
                          </div>
                          <div className="text-right">
                              <p className="font-bold text-[#DC143C]">₹{order.amount.toFixed(2)}</p>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No orders yet</p>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab("orders")}>
                      View All Orders
                    </Button>
                  </CardContent>
                </Card>

                {/* Top Products */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-[#DC143C]" />
                      Top Products
                    </CardTitle>
                    <CardDescription>Best selling products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.length > 0 ? (
                        products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{product.price}</p>
                            <p className="text-xs text-muted-foreground">{product.sold} sold</p>
                          </div>
                        </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No products yet</p>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab("products")}>
                      Manage Products
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-[#DC143C]" />
                        All Orders
                      </CardTitle>
                      <CardDescription>Manage customer orders</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingOrders ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                              <p className="text-muted-foreground">Loading orders...</p>
                            </TableCell>
                          </TableRow>
                        ) : recentOrders.length > 0 ? (
                          recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.customer}</p>
                                <p className="text-xs text-muted-foreground">{order.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>{order.product}</TableCell>
                              <TableCell className="font-semibold text-[#DC143C]">₹{order.amount.toFixed(2)}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-muted-foreground">{order.date}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    title="View Details"
                                    onClick={() => {
                                      setSelectedOrder(order.orderData);
                                      setIsViewOrderOpen(true);
                                    }}
                                  >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    title="Edit Status"
                                    onClick={() => {
                                      setEditingOrder(order.orderData);
                                      setNewOrderStatus(order.orderData.status);
                                      setIsEditOrderOpen(true);
                                    }}
                                  >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>No orders found</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-[#DC143C]" />
                        All Products
                      </CardTitle>
                      <CardDescription>Manage your product inventory</CardDescription>
                    </div>
                    <Button 
                      className="bg-[#DC143C] hover:bg-[#801030]"
                      onClick={() => navigate("/admin/add-product")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Product
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Sold</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingProducts ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                              <p className="text-muted-foreground">Loading products...</p>
                            </TableCell>
                          </TableRow>
                        ) : products.length > 0 ? (
                          products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{product.category}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-[#DC143C]">₹{product.price}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell className="text-muted-foreground">{product.sold}</TableCell>
                            <TableCell>{getStatusBadge(product.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="View on store"
                                  onClick={() => navigate(`/product/${product.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Edit product"
                                  onClick={() => openEditProduct(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>No products found</p>
                              <Button 
                                className="mt-4 bg-[#DC143C] hover:bg-[#801030]"
                                onClick={() => navigate("/admin/add-product")}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Product
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Add Product Dialog */}
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#DC143C] flex items-center gap-2">
                <Plus className="h-6 w-6" />
                Add New Product
              </DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new product to your store
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Product Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="product-image" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#DC143C]" />
                  Product Image *
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#DC143C] transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-48 mx-auto rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setImagePreview("");
                          setImageFile(null);
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="product-image" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG up to 5MB
                      </p>
                      <Input
                        id="product-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name *</Label>
                <Input
                  id="product-name"
                  placeholder="e.g., Premium Sandalwood Dhoop"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="border-2 focus:border-[#DC143C]"
                />
              </div>

              {/* Category and Badge */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                  >
                    <SelectTrigger className="border-2 focus:border-[#DC143C]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Agarbatti">Agarbatti</SelectItem>
                      <SelectItem value="Dhoop">Dhoop</SelectItem>
                      <SelectItem value="Cones">Incense Cones</SelectItem>
                      <SelectItem value="Puja">Puja Essentials</SelectItem>
                      <SelectItem value="Karpure">Karpure</SelectItem>
                      <SelectItem value="Havan">Havan</SelectItem>
                      <SelectItem value="Gift Set">Gift Set</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="badge">Badge (Optional)</Label>
                  <Select
                    value={newProduct.badge || "none"}
                    onValueChange={(value) =>
                      setNewProduct({
                        ...newProduct,
                        badge: value === "none" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-[#DC143C]">
                      <SelectValue placeholder="Select badge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Badge</SelectItem>
                      <SelectItem value="Bestseller">Bestseller</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Popular">Popular</SelectItem>
                      <SelectItem value="Limited">Limited Edition</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price and Original Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="299"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="border-2 focus:border-[#DC143C]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original-price">Original Price (₹)</Label>
                  <Input
                    id="original-price"
                    type="number"
                    placeholder="399"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    className="border-2 focus:border-[#DC143C]"
                  />
                  <p className="text-xs text-muted-foreground">
                          Leave empty if no original price
                  </p>
                </div>
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="50"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="border-2 focus:border-[#DC143C]"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Product Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the product, its features, and benefits..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="border-2 focus:border-[#DC143C] min-h-24"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddProductOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddProduct}
                disabled={isSavingProduct}
                className="bg-[#DC143C] hover:bg-[#801030]"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isSavingProduct ? "Saving..." : "Add Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#DC143C] flex items-center gap-2">
                <Edit className="h-6 w-6" />
                Edit Product
              </DialogTitle>
              <DialogDescription>
                Update product details below
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-product-image" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#DC143C]" />
                  Product Image
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#DC143C] transition-colors">
                  {editImagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg object-cover"
                      />
                      <div className="flex gap-2 justify-center">
                        <label htmlFor="edit-product-image">
                          <Button type="button" variant="outline" asChild>
                            <span>Change Image</span>
                          </Button>
                        </label>
                        <Input
                          id="edit-product-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleEditImageUpload}
                        />
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="edit-product-image" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Click to upload or drag and drop
                      </p>
                      <Input
                        id="edit-product-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleEditImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-product-name">Product Name *</Label>
                <Input
                  id="edit-product-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="border-2 focus:border-[#DC143C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select
                    value={editForm.category}
                    onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                  >
                    <SelectTrigger className="border-2 focus:border-[#DC143C]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Agarbatti">Agarbatti</SelectItem>
                      <SelectItem value="Dhoop">Dhoop</SelectItem>
                      <SelectItem value="Cones">Incense Cones</SelectItem>
                      <SelectItem value="Puja">Puja Essentials</SelectItem>
                      <SelectItem value="Karpure">Karpure</SelectItem>
                      <SelectItem value="Havan">Havan</SelectItem>
                      <SelectItem value="Gift Set">Gift Set</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-badge">Badge (Optional)</Label>
                  <Select
                    value={editForm.badge || "none"}
                    onValueChange={(value) =>
                      setEditForm({
                        ...editForm,
                        badge: value === "none" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-[#DC143C]">
                      <SelectValue placeholder="Select badge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Badge</SelectItem>
                      <SelectItem value="Bestseller">Bestseller</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Popular">Popular</SelectItem>
                      <SelectItem value="Limited">Limited Edition</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (₹) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="border-2 focus:border-[#DC143C]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-original-price">Original Price (₹)</Label>
                  <Input
                    id="edit-original-price"
                    type="number"
                    value={editForm.originalPrice}
                    onChange={(e) =>
                      setEditForm({ ...editForm, originalPrice: e.target.value })
                    }
                    className="border-2 focus:border-[#DC143C]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Quantity *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  className="border-2 focus:border-[#DC143C]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Product Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="border-2 focus:border-[#DC143C] min-h-24"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditProductOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpdateProduct}
                disabled={isSavingProduct}
                className="bg-[#DC143C] hover:bg-[#801030]"
              >
                {isSavingProduct ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Order Details Dialog */}
        <Dialog open={isViewOrderOpen} onOpenChange={setIsViewOrderOpen}>
          <DialogContent className="max-w-[90vw] sm:max-w-[85vw] md:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-y-auto !top-[10%] !translate-y-0">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#DC143C]" />
                    Order Details - {selectedOrder.id}
                  </DialogTitle>
                  <DialogDescription>
                    Complete order information and customer details
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Order Status */}
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Status</p>
                      <p className="text-lg font-semibold">{getStatusBadge(selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1))}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold text-[#DC143C]">₹{selectedOrder.total.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-3">Order Items ({selectedOrder.items.length})</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#DC143C]">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Customer Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Customer Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {selectedOrder.shippingAddress.name}</p>
                        <p><strong>Email:</strong> {selectedOrder.shippingAddress.email || "N/A"}</p>
                        <p><strong>Phone:</strong> {selectedOrder.shippingAddress.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Shipping Address</h3>
                      <div className="space-y-2 text-sm">
                        <p>{selectedOrder.shippingAddress.address}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                        <p>Pincode: {selectedOrder.shippingAddress.pincode}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Information */}
                  <div>
                    <h3 className="font-semibold mb-3">Payment Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                        <p className="font-medium">
                          {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                        </p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Payment Status</p>
                        <p className="font-medium">
                          {selectedOrder.onlinePaymentReview === "pending"
                            ? "Awaiting UPI verification"
                            : selectedOrder.paymentStatus.charAt(0).toUpperCase() +
                              selectedOrder.paymentStatus.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.paymentMethod === "online" &&
                    selectedOrder.onlinePaymentReview === "pending" && (
                      <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-4 space-y-3">
                        <p className="font-semibold text-amber-950">
                          Customer tapped &quot;I have paid&quot; — confirm or reject their UPI payment
                        </p>
                        {!upiRejectMode ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              className="bg-green-600 hover:bg-green-700"
                              disabled={upiReviewLoading}
                              onClick={handleApproveUpi}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Confirm (order placed)
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              disabled={upiReviewLoading}
                              onClick={() => setUpiRejectMode(true)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label htmlFor="upi-reject-reason">Reason (customer will see this)</Label>
                            <Textarea
                              id="upi-reject-reason"
                              rows={3}
                              placeholder="e.g. Amount or UTR did not match our records"
                              value={upiRejectReason}
                              onChange={(e) => setUpiRejectReason(e.target.value)}
                              className="border-2"
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                disabled={upiReviewLoading}
                                onClick={() => {
                                  setUpiRejectMode(false);
                                  setUpiRejectReason("");
                                }}
                              >
                                Back
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                disabled={upiReviewLoading || !upiRejectReason.trim()}
                                onClick={handleSubmitUpiReject}
                              >
                                Submit rejection
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {selectedOrder.paymentMethod === "online" &&
                    selectedOrder.onlinePaymentReview === "rejected" &&
                    selectedOrder.paymentRejectionReason && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                        <strong>Rejection note (customer-facing):</strong>{" "}
                        {selectedOrder.paymentRejectionReason}
                      </div>
                    )}

                  {/* Order Dates */}
                  {selectedOrder.createdAt && (
                    <div>
                      <h3 className="font-semibold mb-3">Order Timeline</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Order Placed:</strong>{" "}
                          {selectedOrder.createdAt.toDate 
                            ? new Date(selectedOrder.createdAt.toDate()).toLocaleString("en-IN")
                            : new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                        </p>
                        {selectedOrder.updatedAt && (
                          <p>
                            <strong>Last Updated:</strong>{" "}
                            {selectedOrder.updatedAt.toDate 
                              ? new Date(selectedOrder.updatedAt.toDate()).toLocaleString("en-IN")
                              : new Date(selectedOrder.updatedAt).toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsViewOrderOpen(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Order Status Dialog */}
        <Dialog open={isEditOrderOpen} onOpenChange={setIsEditOrderOpen}>
          <DialogContent>
            {editingOrder && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5 text-[#DC143C]" />
                    Update Order Status
                  </DialogTitle>
                  <DialogDescription>
                    Change the status of order {editingOrder.id}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="order-status">Order Status</Label>
                    <Select value={newOrderStatus} onValueChange={setNewOrderStatus}>
                      <SelectTrigger className="border-2 focus:border-[#DC143C]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Current Status:</p>
                    <p className="font-medium">{getStatusBadge(editingOrder.status.charAt(0).toUpperCase() + editingOrder.status.slice(1))}</p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditOrderOpen(false);
                      setEditingOrder(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!editingOrder.id) return;
                      
                      try {
                        await updateOrderStatus(editingOrder.id, newOrderStatus as Order['status']);
                        
                        // Update local state
                        setRecentOrders(prevOrders =>
                          prevOrders.map(order =>
                            order.id === editingOrder.id
                              ? { ...order, status: newOrderStatus.charAt(0).toUpperCase() + newOrderStatus.slice(1), orderData: { ...order.orderData, status: newOrderStatus as Order['status'] } }
                              : order
                          )
                        );

                        toast({
                          title: "Order Updated! ✅",
                          description: `Order status has been updated to ${newOrderStatus}`,
                        });

                        setIsEditOrderOpen(false);
                        setEditingOrder(null);
                      } catch (error: any) {
                        toast({
                          title: "Update Failed",
                          description: error.message || "Failed to update order status",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="bg-[#DC143C] hover:bg-[#801030]"
                  >
                    Update Status
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;

