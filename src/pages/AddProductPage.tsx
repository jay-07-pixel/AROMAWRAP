import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Package,
  IndianRupee,
  Tag,
  FileText,
  Sparkles,
  Save,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { isAdminUser } from "@/services/authService";

const AddProductPage = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading } = useAuth();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    originalPrice: "",
    stock: "",
    description: "",
    badge: "",
    features: "",
    packSize: "",
    burningTime: "",
    weight: "",
    ingredients: "",
  });

  if (!loading && !isAdminUser(user?.email, userProfile)) {
    navigate("/account");
    return null;
  }

  if (loading) {
    return null;
  }

  // Handle image upload
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

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please upload a valid image file",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.category || !formData.price || !imagePreview) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and upload an image",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.price);
    const originalPrice = formData.originalPrice ? parseFloat(formData.originalPrice) : undefined;
    const stock = parseInt(formData.stock) || 0;

    if (price <= 0) {
      toast({
        title: "Error",
        description: "Price must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (originalPrice && originalPrice <= price) {
      toast({
        title: "Error",
        description: "Original price must be greater than selling price",
        variant: "destructive",
      });
      return;
    }

    const productId = `PROD-${Date.now()}`;

    const product = {
      id: productId,
      name: formData.name,
      category: formData.category,
      price: price,
      originalPrice: originalPrice,
      stock: stock,
      sold: 0,
      status: stock > 20 ? "In Stock" : stock > 0 ? "Low Stock" : "Out of Stock",
      description: formData.description,
      image: imagePreview,
      badge: formData.badge || undefined,
      details: {
        features: formData.features.split("\n").filter(f => f.trim()),
        packSize: formData.packSize,
        burningTime: formData.burningTime,
        weight: formData.weight,
        ingredients: formData.ingredients,
      },
    };

    // Save to localStorage
    const existingProducts = localStorage.getItem("adminProducts");
    const products = existingProducts ? JSON.parse(existingProducts) : [];
    products.push(product);
    localStorage.setItem("adminProducts", JSON.stringify(products));

    toast({
      title: "Success! 🎉",
      description: `${formData.name} has been added successfully`,
    });

    // Reset form
    setFormData({
      name: "",
      category: "",
      price: "",
      originalPrice: "",
      stock: "",
      description: "",
      badge: "",
      features: "",
      packSize: "",
      burningTime: "",
      weight: "",
      ingredients: "",
    });
    setImagePreview("");

    // Redirect to admin dashboard
    setTimeout(() => {
      navigate("/admin");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-4 text-[#DC143C] hover:text-[#801030] hover:bg-[#FFF1F1]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-[#DC143C]/20 to-[#DC143C]/30 rounded-xl flex items-center justify-center">
              <Package className="h-8 w-8 text-[#DC143C]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#DC143C] flex items-center gap-3">
                Add New Product
              </h1>
              <p className="text-muted-foreground mt-1">
                Create a new product listing for your store
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-[#DC143C]" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Enter the main details of your product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Product Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base">
                        Product Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., AromaWrap Devi Premium Dhoop"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="border-2 focus:border-[#DC143C]"
                      />
                    </div>

                    {/* Category and Badge */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-base flex items-center gap-2">
                          <Tag className="h-4 w-4 text-[#DC143C]" />
                          Category *
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
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
                        <Label htmlFor="badge" className="text-base flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#DC143C]" />
                          Product Badge
                        </Label>
                        <Select
                          value={formData.badge || "none"}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              badge: value === "none" ? "" : value,
                            })
                          }
                        >
                          <SelectTrigger className="border-2 focus:border-[#DC143C]">
                            <SelectValue placeholder="Select badge (optional)" />
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

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#DC143C]" />
                        Product Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe your product, its features, and benefits..."
                        value={formData.description}
                        onChange={handleInputChange}
                        className="border-2 focus:border-[#DC143C] min-h-32"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Pricing & Inventory */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-[#DC143C]" />
                      Pricing & Inventory
                    </CardTitle>
                    <CardDescription>
                      Set pricing and stock information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Price and Original Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-base">
                          Selling Price (₹) *
                        </Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          placeholder="299"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="1"
                          step="0.01"
                          className="border-2 focus:border-[#DC143C]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="originalPrice" className="text-base">
                          Original Price (₹)
                        </Label>
                        <Input
                          id="originalPrice"
                          name="originalPrice"
                          type="number"
                          placeholder="399"
                          value={formData.originalPrice}
                          onChange={handleInputChange}
                          min="1"
                          step="0.01"
                          className="border-2 focus:border-[#DC143C]"
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave empty if no discount
                        </p>
                      </div>
                    </div>


                    {/* Stock */}
                    <div className="space-y-2">
                      <Label htmlFor="stock" className="text-base">
                        Stock Quantity *
                      </Label>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        placeholder="50"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="border-2 focus:border-[#DC143C]"
                      />
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>• 0 units = Out of Stock</span>
                        <span>• 1-20 units = Low Stock</span>
                        <span>• 20+ units = In Stock</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Additional Details */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#DC143C]" />
                      Additional Details
                    </CardTitle>
                    <CardDescription>
                      Optional specifications and features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div className="space-y-2">
                      <Label htmlFor="features" className="text-base">
                        Product Features
                      </Label>
                      <Textarea
                        id="features"
                        name="features"
                        placeholder="Enter each feature on a new line:&#10;100% Natural Ingredients&#10;Long Burning Time&#10;Eco-Friendly Packaging"
                        value={formData.features}
                        onChange={handleInputChange}
                        className="border-2 focus:border-[#DC143C] min-h-24 font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Each line will be a separate feature bullet point
                      </p>
                    </div>

                    {/* Specifications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="packSize">Pack Size</Label>
                        <Input
                          id="packSize"
                          name="packSize"
                          placeholder="e.g., 20 Sticks"
                          value={formData.packSize}
                          onChange={handleInputChange}
                          className="border-2 focus:border-[#DC143C]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="burningTime">Burning Time</Label>
                        <Input
                          id="burningTime"
                          name="burningTime"
                          placeholder="e.g., 45-60 minutes"
                          value={formData.burningTime}
                          onChange={handleInputChange}
                          className="border-2 focus:border-[#DC143C]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          name="weight"
                          placeholder="e.g., 100g"
                          value={formData.weight}
                          onChange={handleInputChange}
                          className="border-2 focus:border-[#DC143C]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ingredients">Main Ingredients</Label>
                        <Input
                          id="ingredients"
                          name="ingredients"
                          placeholder="e.g., Sandalwood, Natural Herbs"
                          value={formData.ingredients}
                          onChange={handleInputChange}
                          className="border-2 focus:border-[#DC143C]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Image & Preview */}
            <div className="lg:col-span-1 space-y-6">
              {/* Product Image */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:sticky lg:top-24"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-[#DC143C]" />
                      Product Image *
                    </CardTitle>
                    <CardDescription>Upload a high-quality image</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#DC143C] transition-colors">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Product Preview"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setImagePreview("")}
                            className="w-full"
                          >
                            Change Image
                          </Button>
                        </div>
                      ) : (
                        <label htmlFor="product-image" className="cursor-pointer block">
                          <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                          <p className="text-sm text-muted-foreground mb-2 font-semibold">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            PNG, JPG, WEBP up to 5MB
                          </p>
                          <Input
                            id="product-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <Badge variant="outline" className="border-[#DC143C] text-[#DC143C]">
                            Required
                          </Badge>
                        </label>
                      )}
                    </div>

                    {/* Image Requirements */}
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-xs">
                      <p className="font-semibold">Image Guidelines:</p>
                      <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                        <li>Use high-resolution images (minimum 800x800px)</li>
                        <li>White or neutral background preferred</li>
                        <li>Show product clearly and attractively</li>
                        <li>Maximum file size: 5MB</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Preview Card */}
                {formData.name && imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="border-2 border-[#DC143C]">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Eye className="h-4 w-4 text-[#DC143C]" />
                          Card Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-white rounded-lg overflow-hidden shadow-md">
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt={formData.name}
                              className="w-full h-48 object-cover"
                            />
                            {formData.badge && (
                              <Badge className="absolute top-2 right-2 bg-[#DC143C]">
                                {formData.badge}
                              </Badge>
                            )}
                          </div>
                          <div className="p-3">
                            <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                              {formData.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {formData.originalPrice && (
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{formData.originalPrice}
                                </span>
                              )}
                              <span className="text-lg font-bold text-[#DC143C]">
                                ₹{formData.price || "0"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Submit Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#DC143C] hover:bg-[#801030]"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Product
            </Button>
          </motion.div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default AddProductPage;








