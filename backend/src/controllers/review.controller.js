// Review Controller
const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where: { productId, isApproved: true },
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: { firstName: true, lastName: true, avatar: true },
          },
        },
      }),
      prisma.review.count({ where: { productId, isApproved: true } }),
      prisma.review.groupBy({
        by: ["rating"],
        where: { productId, isApproved: true },
        _count: true,
      }),
    ]);

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats.forEach((stat) => {
      ratingDistribution[stat.rating] = stat._count;
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        ratingDistribution,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: req.user.id,
        },
      },
    });

    if (existingReview) {
      return next(new AppError("You have already reviewed this product", 400));
    }

    // Check if user purchased this product (verified review)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: req.user.id,
          status: "DELIVERED",
        },
      },
    });

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user.id,
        rating,
        title,
        comment,
        isVerified: !!hasPurchased,
        isApproved: false, // Requires admin approval
      },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Review submitted and pending approval",
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return next(new AppError("Review not found", 404));
    }

    if (review.userId !== req.user.id) {
      return next(new AppError("Not authorized to update this review", 403));
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        rating,
        title,
        comment,
        isApproved: false, // Re-approve after edit
      },
    });

    res.status(200).json({
      success: true,
      message: "Review updated and pending re-approval",
      data: { review: updated },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return next(new AppError("Review not found", 404));
    }

    // Allow owner or admin to delete
    if (
      review.userId !== req.user.id &&
      !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)
    ) {
      return next(new AppError("Not authorized to delete this review", 403));
    }

    await prisma.review.delete({ where: { id } });

    // Update product rating
    await updateProductRating(review.productId);

    res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Admin
exports.getAllReviews = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status, // pending, approved, rejected
      productId,
      userId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status === "pending") {
      where.isApproved = false;
    } else if (status === "approved") {
      where.isApproved = true;
    }

    if (productId) {
      where.productId = productId;
    }

    if (userId) {
      where.userId = userId;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          product: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve review (Admin)
// @route   PATCH /api/reviews/:id/approve
// @access  Admin
exports.approveReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved: true },
    });

    // Update product rating
    await updateProductRating(review.productId);

    res.status(200).json({
      success: true,
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject review (Admin)
// @route   PATCH /api/reviews/:id/reject
// @access  Admin
exports.rejectReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete the review
    const review = await prisma.review.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Review rejected and deleted",
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Update product rating after review changes
async function updateProductRating(productId) {
  const result = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: result._avg.rating || 0,
      reviewCount: result._count,
    },
  });
}
