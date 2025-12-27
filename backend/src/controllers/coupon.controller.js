// Coupon Controller
const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) {
      return next(new AppError("Coupon code is required", 400));
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return next(new AppError("Invalid coupon code", 404));
    }

    // Check if active
    if (!coupon.isActive) {
      return next(new AppError("This coupon is no longer active", 400));
    }

    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return next(new AppError("This coupon has expired", 400));
    }

    // Check start date
    if (coupon.startsAt && new Date(coupon.startsAt) > new Date()) {
      return next(new AppError("This coupon is not yet valid", 400));
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return next(new AppError("This coupon has reached its usage limit", 400));
    }

    // Check minimum order value
    if (coupon.minOrderValue && orderTotal < parseFloat(coupon.minOrderValue)) {
      return next(
        new AppError(
          `Minimum order value of ${parseFloat(
            coupon.minOrderValue
          ).toLocaleString()} is required`,
          400
        )
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = orderTotal * (parseFloat(coupon.discountValue) / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, parseFloat(coupon.maxDiscount));
      }
    } else {
      discount = parseFloat(coupon.discountValue);
    }

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: parseFloat(coupon.discountValue),
          description: coupon.description,
        },
        discount,
        newTotal: orderTotal - discount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Admin
exports.getAllCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.coupon.count({ where }),
    ]);

    // Format decimal values
    const formattedCoupons = coupons.map((c) => ({
      ...c,
      discountValue: parseFloat(c.discountValue),
      minOrderValue: c.minOrderValue ? parseFloat(c.minOrderValue) : null,
      maxDiscount: c.maxDiscount ? parseFloat(c.maxDiscount) : null,
    }));

    res.status(200).json({
      success: true,
      data: {
        coupons: formattedCoupons,
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

// @desc    Get coupon by ID (Admin)
// @route   GET /api/coupons/:id
// @access  Admin
exports.getCouponById = async (req, res, next) => {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: req.params.id },
    });

    if (!coupon) {
      return next(new AppError("Coupon not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        coupon: {
          ...coupon,
          discountValue: parseFloat(coupon.discountValue),
          minOrderValue: coupon.minOrderValue
            ? parseFloat(coupon.minOrderValue)
            : null,
          maxDiscount: coupon.maxDiscount
            ? parseFloat(coupon.maxDiscount)
            : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create coupon (Admin)
// @route   POST /api/coupons
// @access  Admin
exports.createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      startsAt,
      expiresAt,
      isActive,
    } = req.body;

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return next(new AppError("Coupon code already exists", 400));
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        minOrderValue,
        maxDiscount,
        usageLimit,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== false,
      },
    });

    res.status(201).json({
      success: true,
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Admin
exports.updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      startsAt,
      expiresAt,
      isActive,
    } = req.body;

    // Check if new code conflicts with existing
    if (code) {
      const existing = await prisma.coupon.findFirst({
        where: {
          code: code.toUpperCase(),
          NOT: { id },
        },
      });

      if (existing) {
        return next(new AppError("Coupon code already exists", 400));
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: code ? code.toUpperCase() : undefined,
        description,
        discountType,
        discountValue,
        minOrderValue,
        maxDiscount,
        usageLimit,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        isActive,
      },
    });

    res.status(200).json({
      success: true,
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Admin
exports.deleteCoupon = async (req, res, next) => {
  try {
    await prisma.coupon.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle coupon status (Admin)
// @route   PATCH /api/coupons/:id/toggle-status
// @access  Admin
exports.toggleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return next(new AppError("Coupon not found", 404));
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });

    res.status(200).json({
      success: true,
      data: { coupon: updated },
    });
  } catch (error) {
    next(error);
  }
};
