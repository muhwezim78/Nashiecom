// Order Controller
const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const { v4: uuidv4 } = require("uuid");

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NSH-${timestamp}-${random}`;
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          items: {
            include: {
              product: {
                select: { name: true },
              },
            },
          },
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Format decimal values
    const formattedOrders = orders.map((order) => ({
      ...order,
      subtotal: parseFloat(order.subtotal),
      shippingCost: parseFloat(order.shippingCost),
      tax: parseFloat(order.tax),
      discount: parseFloat(order.discount),
      total: parseFloat(order.total),
    }));

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
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

// @desc    Get current user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, slug: true },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map((order) => ({
      ...order,
      subtotal: parseFloat(order.subtotal),
      total: parseFloat(order.total),
    }));

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
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

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Check ownership (unless admin)
    if (
      order.userId !== req.user.id &&
      !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)
    ) {
      return next(new AppError("Not authorized to view this order", 403));
    }

    const formattedOrder = {
      ...order,
      subtotal: parseFloat(order.subtotal),
      shippingCost: parseFloat(order.shippingCost),
      tax: parseFloat(order.tax),
      discount: parseFloat(order.discount),
      total: parseFloat(order.total),
      items: order.items.map((item) => ({
        ...item,
        price: parseFloat(item.price),
        subtotal: parseFloat(item.subtotal),
      })),
    };

    res.status(200).json({
      success: true,
      data: { order: formattedOrder },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      idempotencyKey,
      couponCode,
      customerNote,
    } = req.body;

    // --- Idempotency Check ---
    if (idempotencyKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: { items: true, address: true },
      });

      if (existingOrder) {
        console.log(
          `[Idempotency] Returning existing order: ${existingOrder.orderNumber}`
        );
        return res.status(200).json({
          success: true,
          data: { order: existingOrder },
        });
      }
    }

    // --- Mobile Money Logic ---
    if (paymentMethod === "MOBILE_MONEY") {
      if (
        !paymentDetails ||
        !paymentDetails.phoneNumber ||
        !paymentDetails.network
      ) {
        return next(
          new AppError("Mobile Money requires phone number and network", 400)
        );
      }

      console.log(
        `[MOMO] Initiating Payment on ${paymentDetails.network} for ${paymentDetails.phoneNumber}...`
      );
      // TODO: Integrate actual API calls here using process.env.MTN_MOMO_API_KEY etc.
      // For now, we assume pending status until callback or manual confirm.
    }

    // Validate and calculate order
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
        },
      });

      if (!product) {
        return next(new AppError(`Product not found: ${item.productId}`, 400));
      }

      if (!product.inStock || product.quantity < item.quantity) {
        return next(
          new AppError(`Insufficient stock for: ${product.name}`, 400)
        );
      }

      const itemSubtotal = parseFloat(product.price) * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0]?.url,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // Calculate taxes and fees
    const taxRate = 0.08; // 8% tax
    const freeShippingThreshold = 500000;
    const defaultShippingFee = 25000;

    const tax = subtotal * taxRate;
    const shippingCost =
      subtotal >= freeShippingThreshold ? 0 : defaultShippingFee;

    // Apply coupon discount if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        if (coupon.discountType === "PERCENTAGE") {
          discount = subtotal * (parseFloat(coupon.discountValue) / 100);
          if (coupon.maxDiscount) {
            discount = Math.min(discount, parseFloat(coupon.maxDiscount));
          }
        } else {
          discount = parseFloat(coupon.discountValue);
        }

        // Increment coupon usage
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const total = subtotal + tax + shippingCost - discount;

    // Create or get address
    let addressId = null;
    if (shippingAddress.id) {
      addressId = shippingAddress.id;
    } else {
      const address = await prisma.address.create({
        data: {
          userId: req.user.id,
          ...shippingAddress,
        },
      });
      addressId = address.id;
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user.id,
        addressId,
        subtotal,
        shippingCost,
        tax,
        discount,
        total,
        paymentMethod,
        paymentDetails,
        idempotencyKey,
        couponCode: couponCode?.toUpperCase(),
        customerNote,
        items: {
          create: orderItems,
        },
        statusHistory: {
          create: {
            status: "PENDING",
            note: "Order created",
            createdBy: req.user.id,
          },
        },
      },
      include: {
        items: true,
        address: true,
      },
    });

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: { decrement: item.quantity },
        },
      });

      // Check and update inStock status
      const updatedProduct = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (updatedProduct.quantity <= 0) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { inStock: false },
        });
      }
    }

    // Clear user's cart
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id },
    });

    res.status(201).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   POST /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    if (order.userId !== req.user.id) {
      return next(new AppError("Not authorized to cancel this order", 403));
    }

    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      return next(new AppError("Order cannot be cancelled at this stage", 400));
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        statusHistory: {
          create: {
            status: "CANCELLED",
            note: reason || "Cancelled by customer",
            createdBy: req.user.id,
          },
        },
      },
    });

    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: { increment: item.quantity },
          inStock: true,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { order: updatedOrder },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PATCH /api/orders/:id/status
// @access  Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ];
    if (!validStatuses.includes(status)) {
      return next(new AppError("Invalid status", 400));
    }

    const updateData = { status };

    // Set timestamp based on status
    switch (status) {
      case "SHIPPED":
        updateData.shippedAt = new Date();
        break;
      case "DELIVERED":
        updateData.deliveredAt = new Date();
        break;
      case "CANCELLED":
        updateData.cancelledAt = new Date();
        break;
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        statusHistory: {
          create: {
            status,
            note,
            createdBy: req.user.id,
          },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status (Admin)
// @route   PATCH /api/orders/:id/payment-status
// @access  Admin
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = [
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
    ];
    if (!validStatuses.includes(paymentStatus)) {
      return next(new AppError("Invalid payment status", 400));
    }

    const updateData = { paymentStatus };
    if (paymentStatus === "PAID") {
      updateData.paidAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add tracking number (Admin)
// @route   POST /api/orders/:id/tracking
// @access  Admin
exports.addTracking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { trackingNumber, shippingMethod } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        trackingNumber,
        shippingMethod,
        statusHistory: {
          create: {
            status: "SHIPPED",
            note: `Tracking: ${trackingNumber}`,
            createdBy: req.user.id,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order (Admin)
// @route   DELETE /api/orders/:id
// @access  Admin
exports.deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.order.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/stats
// @access  Admin
exports.getOrderStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      todayOrders,
      todayRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: today }, paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
          },
          paymentStatus: "PAID",
        },
        _sum: { total: true },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOrders,
          pendingOrders,
          completedOrders,
          todayOrders,
          todayRevenue: parseFloat(todayRevenue._sum.total || 0),
          monthlyRevenue: parseFloat(monthlyRevenue._sum.total || 0),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Confirm delivery (Client or Admin)
// @route   PATCH /api/orders/:id/confirm-delivery
// @access  Private
exports.confirmDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.user.role);

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    const updateData = {};
    if (isAdmin) {
      updateData.adminConfirmedDelivery = true;
    } else {
      if (order.userId !== req.user.id) {
        return next(new AppError("Not authorized to confirm this order", 403));
      }
      updateData.clientConfirmedDelivery = true;
    }

    // Check if both are now confirmed
    const finalAdminConfirmed = isAdmin ? true : order.adminConfirmedDelivery;
    const finalClientConfirmed = !isAdmin
      ? true
      : order.clientConfirmedDelivery;

    if (finalAdminConfirmed && finalClientConfirmed) {
      updateData.status = "DELIVERED";
      updateData.deliveredAt = new Date();

      // Auto-mark payment as PAID if it was Payment on Delivery (COD)
      if (order.paymentMethod === "COD" && order.paymentStatus !== "PAID") {
        updateData.paymentStatus = "PAID";
        updateData.paidAt = new Date();
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        statusHistory: {
          create: {
            status:
              finalAdminConfirmed && finalClientConfirmed
                ? "DELIVERED"
                : order.status,
            note: `Delivery confirmed by ${isAdmin ? "Admin" : "Client"}`,
            createdBy: req.user.id,
          },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });

    res.status(200).json({
      success: true,
      data: { order: updatedOrder },
    });
  } catch (error) {
    next(error);
  }
};
