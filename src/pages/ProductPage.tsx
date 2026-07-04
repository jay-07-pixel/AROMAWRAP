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
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import {
  getProduct,
  getProductPath,
  getProductPublicUrl,
  type Product,
} from "@/services/productService";
import { toast } from "@/hooks/use-toast";
import {
  formatReviewDate,
  getMyProductReview,
  listProductReviews,
  renderStarCount,
  submitProductReview,
  type ProductReview,
} from "@/services/reviewService";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { isLegacyProductId } from "@/lib/legacyProducts";

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
  size = "h-7 w-7 sm:h-6 sm:w-6",
  disabled = false,
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1" role="group" aria-label="Rate this product">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className="p-1.5 sm:p-0.5 rounded-md hover:scale-110 active:scale-95 transition-transform touch-manipulation disabled:opacity-50"
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className={`${size} ${
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
  const reviewFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }

    if (isLegacyProductId(productId)) {
      setProduct(null);
      setLoading(false);
      setError(null);
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

  // Canonical URL: /product/lavender-incense-sticks (stable for packaging QR codes)
  useEffect(() => {
    if (!product?.slug || !productId) return;
    if (productId !== product.slug) {
      navigate(getProductPath(product), { replace: true });
    }
  }, [product, productId, navigate]);

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
    if (!product?.id) {
      setReviews([]);
      return;
    }

    let active = true;

    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const { items } = await listProductReviews(product.id, 1, 20);
        if (active) setReviews(items);
      } catch (loadError) {
        console.error("Error loading reviews:", loadError);
        if (active) setReviews([]);
      } finally {
        if (active) setReviewsLoading(false);
      }
    };

    loadReviews();
    return () => {
      active = false;
    };
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id || !user) {
      setMyReview(null);
      return;
    }

    let active = true;

    const loadMyReview = async () => {
      try {
        const review = await getMyProductReview(product.id);
        if (!active) return;
        setMyReview(review);
        if (review) {
          setReviewRating(review.rating);
          setReviewTitle(review.title || "");
          setReviewComment(review.comment || "");
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
  }, [product?.id, user]);

  const refreshProductAndReviews = async () => {
    if (!product?.id) return;
    const [updatedProduct, reviewData] = await Promise.all([
      getProduct(product.id),
      listProductReviews(product.id, 1, 20),
    ]);
    if (updatedProduct) setProduct(updatedProduct);
    setReviews(reviewData.items);
    if (user) {
      const mine = await getMyProductReview(product.id);
      setMyReview(mine);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;

    if (!user) {
      navigate("/account");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await submitProductReview(product.id, {
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
      });
      await refreshProductAndReviews();
      toast({
        title: myReview ? "Review updated" : "Rating submitted",
        description: reviewComment.trim()
          ? "Thank you for sharing your feedback!"
          : `Your ${reviewRating}-star rating has been saved.`,
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

  const handleHeaderRating = async (value: number) => {
    if (!user) {
      navigate("/account");
      return;
    }
    if (!product?.id || isSubmittingReview) return;

    setReviewRating(value);
    setIsSubmittingReview(true);
    try {
      await submitProductReview(product.id, { rating: value });
      await refreshProductAndReviews();
      toast({
        title: myReview ? "Rating updated" : "Rating saved",
        description: `You rated this product ${value} out of 5 stars.`,
      });
    } catch (submitError: any) {
      toast({
        title: "Could not save rating",
        description: submitError?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const headerStarValue = user ? reviewRating : renderStarCount(rating);

  return (
    <div className="min-h-screen flex flex-col">
      <CartDrawer />
      <Header />

      <section className="bg-background py-2 sm:py-4 border-b hidden sm:block">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-2 text-sm overflow-x-auto">
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

      <section className="py-4 sm:py-6 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 w-full max-w-md mx-auto lg:max-w-sm">
              <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl group max-h-72 sm:max-h-96 bg-gray-100">
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

            <div className="space-y-3 sm:space-y-4 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-300 mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Products
              </Button>

              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>

                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                  <StarRatingInput
                    value={headerStarValue}
                    onChange={handleHeaderRating}
                    disabled={isSubmittingReview}
                  />
                  <div className="text-sm text-muted-foreground">
                    {reviewCount > 0 ? (
                      <span>
                        <span className="font-semibold text-foreground">{ratingLabel}</span>
                        {" · "}
                        {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                        {user && !myReview && (
                          <span className="block sm:inline sm:ml-1 text-primary">
                            · Tap a star to save your rating
                          </span>
                        )}
                      </span>
                    ) : user ? (
                      <span>Tap a star to save your rating</span>
                    ) : (
                      <span>
                        No reviews yet ·{" "}
                        <Link to="/account" className="text-primary font-medium hover:underline">
                          Sign in to rate
                        </Link>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-3 sm:p-4 border border-primary/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                    <span className="text-2xl sm:text-3xl font-bold text-primary shrink-0">
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-base sm:text-xl text-muted-foreground line-through shrink-0">
                        ₹{product.originalPrice}
                      </span>
                    )}
                    {product.badge && (
                      <Badge className="bg-primary text-white px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-bold shrink-0">
                        {product.badge}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
                    <span className="font-medium text-foreground text-sm">Qty:</span>
                    <div className="flex items-center gap-1 border-2 border-primary/20 rounded-lg bg-white shadow-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-9 h-9 sm:w-8 sm:h-8 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed text-primary"
                      >
                        <Minus className="h-4 w-4 sm:h-3 sm:w-3" />
                      </Button>
                      <span className="px-3 py-1 min-w-[2.5rem] text-center text-base font-bold text-primary">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(1)}
                        className="w-9 h-9 sm:w-8 sm:h-8 hover:bg-primary/10 text-primary"
                      >
                        <Plus className="h-4 w-4 sm:h-3 sm:w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold py-3 text-base sm:text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2 shrink-0" />
                    Add to Cart
                  </Button>

                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 text-base sm:text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => {
                      handleAddToCart();
                      alert("Redirecting to checkout...");
                    }}
                  >
                    Buy Now
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
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
                    onClick={async () => {
                      const url = getProductPublicUrl(product);
                      try {
                        if (navigator.share) {
                          await navigator.share({ title: product.name, url });
                          return;
                        }
                        await navigator.clipboard.writeText(url);
                        toast({
                          title: "Link copied",
                          description: url,
                        });
                      } catch {
                        /* user cancelled share */
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="mt-4 sm:mt-6">
                <div className="grid grid-cols-3 gap-2 mb-4 sm:flex sm:flex-wrap sm:gap-3 sm:mb-6">
                  {[
                    { id: "description", label: "Description" },
                    { id: "specifications", label: "Specs" },
                    { id: "reviews", label: "Reviews" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-2 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold text-xs sm:text-base transition-all duration-300 text-center ${
                        activeTab === tab.id
                          ? "bg-primary text-white shadow-lg"
                          : "bg-white text-foreground hover:bg-primary/10 hover:text-primary border border-gray-200 hover:border-primary/30"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-100">
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

                        <div
                          ref={reviewFormRef}
                          className="rounded-lg border border-primary/20 bg-primary/5 p-3 sm:p-6"
                        >
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
                                  disabled={isSubmittingReview}
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
                                <Label htmlFor="review-comment">
                                  Your review{" "}
                                  <span className="text-muted-foreground font-normal">
                                    (optional)
                                  </span>
                                </Label>
                                <Textarea
                                  id="review-comment"
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  placeholder="Share what you liked about this product (optional)..."
                                  className="border-2 focus:border-primary min-h-28"
                                  maxLength={2000}
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
                                    ? reviewComment.trim()
                                      ? "Update Review"
                                      : "Update Rating"
                                    : reviewComment.trim()
                                      ? "Submit Review"
                                      : "Submit Rating"}
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
                                {review.comment ? (
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {review.comment}
                                  </p>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">
                                    Rated {review.rating} out of 5 stars
                                  </p>
                                )}
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
