// Dashboard Analytics Controller
const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Admin
exports.getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalProducts,
      activeProducts,
      totalCategories,
      totalUsers,
      totalOrders,
      pendingOrders,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      todayOrders,
      pendingMessages,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true, inStock: true } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: thisMonth },
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: lastMonth, lte: lastMonthEnd },
        },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.contactMessage.count({ where: { status: "NEW" } }),
    ]);

    // Calculate growth
    const currentRevenue = parseFloat(thisMonthRevenue._sum.total || 0);
    const previousRevenue = parseFloat(lastMonthRevenue._sum.total || 0);
    const revenueGrowth =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 100;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          products: {
            total: totalProducts,
            active: activeProducts,
          },
          categories: totalCategories,
          users: totalUsers,
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            today: todayOrders,
          },
          revenue: {
            total: parseFloat(totalRevenue._sum.total || 0),
            thisMonth: currentRevenue,
            lastMonth: previousRevenue,
            growth: Math.round(revenueGrowth * 100) / 100,
          },
          messages: {
            pending: pendingMessages,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue statistics
// @route   GET /api/dashboard/revenue
// @access  Admin
exports.getRevenueStats = async (req, res, next) => {
  try {
    const { period = "7days" } = req.query;

    let startDate;
    switch (period) {
      case "30days":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "12months":
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 7days
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        paymentStatus: "PAID",
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const revenueByDate = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
      }
      revenueByDate[date] += parseFloat(order.total);
    });

    const chartData = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    res.status(200).json({
      success: true,
      data: { chartData },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics
// @route   GET /api/dashboard/orders
// @access  Admin
exports.getOrderStats = async (req, res, next) => {
  try {
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });

    const paymentCounts = await prisma.order.groupBy({
      by: ["paymentStatus"],
      _count: true,
    });

    res.status(200).json({
      success: true,
      data: {
        byStatus: Object.fromEntries(
          statusCounts.map((s) => [s.status, s._count])
        ),
        byPayment: Object.fromEntries(
          paymentCounts.map((p) => [p.paymentStatus, p._count])
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top selling products
// @route   GET /api/dashboard/products/top
// @access  Admin
exports.getTopProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      _count: true,
      orderBy: { _sum: { quantity: "desc" } },
      take: parseInt(limit),
    });

    // Get product details
    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    const result = topProducts.map((tp) => {
      const product = products.find((p) => p.id === tp.productId);
      return {
        id: tp.productId,
        name: product?.name || "Deleted Product",
        image: product?.images[0]?.url,
        soldCount: tp._sum.quantity,
        orderCount: tp._count,
        price: product ? parseFloat(product.price) : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: { products: result },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock products
// @route   GET /api/dashboard/products/low-stock
// @access  Admin
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        trackInventory: true,
        quantity: { lte: prisma.product.fields.lowStockThreshold },
      },
      take: parseInt(limit),
      orderBy: { quantity: "asc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true } },
      },
    });

    const result = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0]?.url,
      category: p.category.name,
      quantity: p.quantity,
      lowStockThreshold: p.lowStockThreshold,
      price: parseFloat(p.price),
    }));

    res.status(200).json({
      success: true,
      data: { products: result },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer statistics
// @route   GET /api/dashboard/customers
// @access  Admin
exports.getCustomerStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, newThisMonth, activeLastMonth, topCustomers] =
      await Promise.all([
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.user.count({
          where: {
            role: "CUSTOMER",
            createdAt: {
              gte: new Date(today.getFullYear(), today.getMonth(), 1),
            },
          },
        }),
        prisma.user.count({
          where: {
            role: "CUSTOMER",
            lastLoginAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        // Top customers by order value
        prisma.order.groupBy({
          by: ["userId"],
          where: { paymentStatus: "PAID" },
          _sum: { total: true },
          _count: true,
          orderBy: { _sum: { total: "desc" } },
          take: 5,
        }),
      ]);

    // Get user details for top customers
    const userIds = topCustomers.map((c) => c.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    const topCustomersDetails = topCustomers.map((tc) => {
      const user = users.find((u) => u.id === tc.userId);
      return {
        id: tc.userId,
        name: user ? `${user.firstName} ${user.lastName}` : "Unknown",
        email: user?.email,
        totalSpent: parseFloat(tc._sum.total || 0),
        orderCount: tc._count,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total,
          newThisMonth,
          activeLastMonth,
        },
        topCustomers: topCustomersDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
// @access  Admin
exports.getRecentOrders = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const orders = await prisma.order.findMany({
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        _count: { select: { items: true } },
      },
    });

    const result = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: `${o.user.firstName} ${o.user.lastName}`,
      email: o.user.email,
      total: parseFloat(o.total),
      status: o.status,
      paymentStatus: o.paymentStatus,
      itemCount: o._count.items,
      createdAt: o.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: { orders: result },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Admin
exports.getRecentActivity = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const [recentOrders, recentReviews, recentMessages, recentUsers] =
      await Promise.all([
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            createdAt: true,
            user: { select: { firstName: true, lastName: true } },
          },
        }),
        prisma.review.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            createdAt: true,
            user: { select: { firstName: true } },
            product: { select: { name: true } },
          },
        }),
        prisma.contactMessage.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            subject: true,
            createdAt: true,
          },
        }),
        prisma.user.findMany({
          take: 5,
          where: { role: "CUSTOMER" },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        }),
      ]);

    // Combine and sort activities
    const activities = [
      ...recentOrders.map((o) => ({
        type: "order",
        message: `New order ${o.orderNumber} by ${o.user.firstName} ${o.user.lastName}`,
        timestamp: o.createdAt,
        id: o.id,
      })),
      ...recentReviews.map((r) => ({
        type: "review",
        message: `${r.user.firstName} rated "${r.product.name}" ${r.rating} stars`,
        timestamp: r.createdAt,
        id: r.id,
      })),
      ...recentMessages.map((m) => ({
        type: "message",
        message: `New message from ${m.name}: ${m.subject}`,
        timestamp: m.createdAt,
        id: m.id,
      })),
      ...recentUsers.map((u) => ({
        type: "user",
        message: `New customer: ${u.firstName} ${u.lastName}`,
        timestamp: u.createdAt,
        id: u.id,
      })),
    ];

    // Sort by timestamp and limit
    activities.sort((a, b) => b.timestamp - a.timestamp);
    const limitedActivities = activities.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: { activities: limitedActivities },
    });
  } catch (error) {
    next(error);
  }
};
