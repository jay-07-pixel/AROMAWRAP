import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { getProduct, type Product } from "@/services/productService";
import {
  formatReviewDate,
  getMyProductReview,
  listProductReviews,
  renderStarCount,
  submitProductReview,
  type ProductReview,
} from "@/services/reviewService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

function StarDisplay({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  const filled = renderStarCount(rating);
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < filled ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </>
  );
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 rounded hover:scale-110 transition-transform"
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className={`h-6 w-6 ${
              star <= value ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addProduct } = useRecentlyViewed();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [myReview, setMyReview] = useState<ProductReview | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      setSelectedImage(0);

      try {
        const result = await getProduct(productId);
        if (!active) return;
        setProduct(result);
      } catch (loadError) {
        if (!active) return;
        console.error("Error loading product:", loadError);
        setProduct(null);
        setError("Failed to load product. Please try again.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    if (product) {
      addProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        badge: product.badge,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  useEffect(() => {
    if (!productId) return;

    let active = true;

    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const { items } = await listProductReviews(productId, 1, 20);
        if (active) setReviews(items);
      } catch (loadError) {
        console.error("Error loading reviews:", loadError);
      } finally {
        if (active) setReviewsLoading(false);
      }
    };

    loadReviews();
    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    if (!productId || !user) {
      setMyReview(null);
      return;
    }

    let active = true;

    const loadMyReview = async () => {
      try {
        const review = await getMyProductReview(productId);
        if (!active) return;
        setMyReview(review);
        if (review) {
          setReviewRating(review.rating);
          setReviewTitle(review.title || "");
          setReviewComment(review.comment);
        } else {
          setReviewRating(5);
          setReviewTitle("");
          setReviewComment("");
        }
      } catch (loadError) {
        console.error("Error loading your review:", loadError);
      }
    };

    loadMyReview();
    return () => {
      active = false;
    };
  }, [productId, user]);

  const refreshProductAndReviews = async () => {
    if (!productId) return;
    const [updatedProduct, reviewData] = await Promise.all([
      getProduct(productId),
      listProductReviews(productId, 1, 20),
    ]);
    if (updatedProduct) setProduct(updatedProduct);
    setReviews(reviewData.items);
    if (user) {
      const mine = await getMyProductReview(productId);
      setMyReview(mine);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    if (!user) {
      navigate("/account");
      return;
    }

    if (!reviewComment.trim()) {
      toast({
        title: "Review required",
        description: "Please write your review before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      await submitProductReview(productId, {
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
      });
      await refreshProductAndReviews();
      toast({
        title: myReview ? "Review updated" : "Review submitted",
        description: "Thank you for sharing your feedback!",
      });
    } catch (submitError: any) {
      toast({
        title: "Could not submit review",
        description: submitError?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <CartDrawer />
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const productImages = product.images?.length
    ? product.images
    : [product.image];
  const rating = product.rating ?? 0;
  const reviewCount = product.reviews ?? 0;
  const ratingLabel = reviewCount > 0 ? rating.toFixed(1) : "—";

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <CartDrawer />
      <Header />

      <section className="bg-background py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate("/")}
              className="text-primary hover:text-secondary transition-colors"
            >
              Home
            </button>
            <span className="text-muted-foreground">/</span>
            <button
              onClick={() => navigate("/")}
              className="text-primary hover:text-secondary transition-colors"
            >
              Collections
            </button>
            <span className="text-muted-foreground">/</span>
            <button
              onClick={() => navigate(-1)}
              className="text-primary hover:text-secondary transition-colors"
            >
              Products
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-semibold">{product.name}</span>
          </div>
        </div>
      </section>

      <section className="py-6 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3 max-w-md mx-auto lg:max-w-sm">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl group max-h-96 bg-gray-100">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 bg-gray-100 ${
                      selectedImage === index
                        ? "border-primary shadow-md"
                        : "border-gray-200 hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-300 mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Products
              </Button>

              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <StarDisplay rating={rating} />
                  </div>
                  {reviewCount > 0 && (
                    <>
                      <span className="font-semibold text-foreground">{ratingLabel}</span>
                      <span className="text-muted-foreground">
                        ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                      </span>
                    </>
                  )}
                  {reviewCount === 0 && (
                    <span className="text-muted-foreground">No reviews yet</span>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4 border border-primary/10">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-3xl font-bold text-primary">
                        ₹{product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xl text-muted-foreground line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                      {product.badge && (
                        <Badge className="bg-primary text-white px-3 py-1 text-sm font-bold">
                          {product.badge}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">Qty:</span>
                    <div className="flex items-center gap-1 border-2 border-primary/20 rounded-lg bg-white shadow-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-8 h-8 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed text-primary"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="px-3 py-1 min-w-[2.5rem] text-center text-base font-bold text-primary">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(1)}
                        className="w-8 h-8 hover:bg-primary/10 text-primary"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold py-3 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 min-w-0"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>

                  <Button
                    size="lg"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 min-w-0"
                    onClick={() => {
                      handleAddToCart();
                      alert("Redirecting to checkout...");
                    }}
                  >
                    Buy Now
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`flex-1 py-2 rounded-lg transition-all duration-300 ${
                      isWishlisted
                        ? "text-red-500 border-red-500 bg-red-50 hover:bg-red-100"
                        : "border-primary/20 hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 mr-1 ${isWishlisted ? "fill-current" : ""}`}
                    />
                    {isWishlisted ? "Wishlisted" : "Wishlist"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 py-2 rounded-lg border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex flex-wrap gap-3 mb-6 justify-center">
                  {[
                    { id: "description", label: "Description" },
                    { id: "specifications", label: "Specifications" },
                    { id: "reviews", label: "Reviews" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 rounded-lg font-semibold text-base transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-primary text-white shadow-lg"
                          : "bg-white text-foreground hover:bg-primary/10 hover:text-primary border border-gray-200 hover:border-primary/30"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
                  {activeTab === "description" && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        Product Description
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {activeTab === "specifications" && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        Specifications
                      </h3>
                      {Object.keys(product.specifications).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(product.specifications).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between py-2 border-b"
                              >
                                <span className="font-medium text-muted-foreground">
                                  {key}:
                                </span>
                                <span className="text-foreground">{value}</span>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          Specifications are not available for this product yet.
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === "reviews" && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        Customer Reviews
                      </h3>
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-4 border-b">
                          <div className="text-center">
                            <div className="text-3xl font-bold">{ratingLabel}</div>
                            <div className="flex items-center gap-1 justify-center">
                              <StarDisplay rating={rating} />
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {reviewCount > 0
                                ? `Based on ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`
                                : "Be the first to review"}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 md:p-6">
                          <h4 className="font-semibold mb-4">
                            {myReview ? "Update your review" : "Write a review"}
                          </h4>
                          {user ? (
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                              <div className="space-y-2">
                                <Label>Your rating *</Label>
                                <StarRatingInput
                                  value={reviewRating}
                                  onChange={setReviewRating}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="review-title">Review title (optional)</Label>
                                <Input
                                  id="review-title"
                                  value={reviewTitle}
                                  onChange={(e) => setReviewTitle(e.target.value)}
                                  placeholder="Summarize your experience"
                                  maxLength={100}
                                  className="border-2 focus:border-primary"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="review-comment">Your review *</Label>
                                <Textarea
                                  id="review-comment"
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  placeholder="Share what you liked about this product..."
                                  className="border-2 focus:border-primary min-h-28"
                                  maxLength={2000}
                                  required
                                />
                              </div>
                              <Button
                                type="submit"
                                disabled={isSubmittingReview}
                                className="bg-primary hover:bg-primary/90"
                              >
                                {isSubmittingReview
                                  ? "Submitting..."
                                  : myReview
                                    ? "Update Review"
                                    : "Submit Review"}
                              </Button>
                            </form>
                          ) : (
                            <p className="text-muted-foreground">
                              Please{" "}
                              <Link
                                to="/account"
                                className="text-primary font-medium hover:underline"
                              >
                                sign in
                              </Link>{" "}
                              to leave a rating and review.
                            </p>
                          )}
                        </div>

                        {reviewsLoading ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Loading reviews...
                          </div>
                        ) : reviews.length > 0 ? (
                          <div className="space-y-4">
                            {reviews.map((review) => (
                              <div key={review.id} className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <StarDisplay rating={review.rating} size="h-4 w-4" />
                                  </div>
                                  {review.title && (
                                    <span className="font-medium">{review.title}</span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {review.comment}
                                </p>
                                <div className="text-xs text-muted-foreground mt-2">
                                  — {review.authorName} · {formatReviewDate(review.createdAt)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center py-6 text-muted-foreground">
                            No reviews yet. Be the first to share your experience!
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductPage;
