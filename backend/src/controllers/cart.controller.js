// Cart Controller
const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            category: { select: { name: true } },
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format and calculate totals
    const items = cartItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: parseFloat(item.product.price),
        originalPrice: item.product.originalPrice
          ? parseFloat(item.product.originalPrice)
          : null,
        image: item.product.images[0]?.url,
        category: item.product.category.name,
        inStock: item.product.inStock,
        availableQuantity: item.product.quantity,
        rating: parseFloat(item.product.rating),
      },
      subtotal: parseFloat(item.product.price) * item.quantity,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    res.status(200).json({
      success: true,
      data: {
        items,
        summary: {
          itemCount,
          subtotal,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    if (!product.isActive) {
      return next(new AppError("Product is not available", 400));
    }

    if (!product.inStock || product.quantity < quantity) {
      return next(new AppError("Insufficient stock", 400));
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (product.quantity < newQuantity) {
        return next(
          new AppError("Cannot add more items. Insufficient stock.", 400)
        );
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity,
        },
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: {
        item: {
          id: cartItem.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          product: {
            name: cartItem.product.name,
            price: parseFloat(cartItem.product.price),
            image: cartItem.product.images[0]?.url,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Check stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    if (product.quantity < quantity) {
      return next(
        new AppError(`Only ${product.quantity} items available`, 400)
      );
    }

    // Find cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    if (!cartItem) {
      return next(new AppError("Item not in cart", 404));
    }

    // Update quantity
    const updated = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        item: {
          id: updated.id,
          productId: updated.productId,
          quantity: updated.quantity,
          subtotal: parseFloat(updated.product.price) * updated.quantity,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    if (!cartItem) {
      return next(new AppError("Item not in cart", 404));
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id },
    });

    res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync cart from frontend (merge local storage cart)
// @route   POST /api/cart/sync
// @access  Private
exports.syncCart = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return next(new AppError("Items must be an array", 400));
    }

    const results = {
      synced: [],
      failed: [],
    };

    for (const item of items) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          results.failed.push({
            productId: item.productId,
            reason: "Product not available",
          });
          continue;
        }

        const quantity = Math.min(item.quantity, product.quantity);
        if (quantity < 1) {
          results.failed.push({
            productId: item.productId,
            reason: "Out of stock",
          });
          continue;
        }

        await prisma.cartItem.upsert({
          where: {
            userId_productId: {
              userId: req.user.id,
              productId: item.productId,
            },
          },
          create: {
            userId: req.user.id,
            productId: item.productId,
            quantity,
          },
          update: {
            quantity,
          },
        });

        results.synced.push({
          productId: item.productId,
          quantity,
        });
      } catch (err) {
        results.failed.push({
          productId: item.productId,
          reason: "Sync failed",
        });
      }
    }

    // Get updated cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        results,
        cart: {
          items: cartItems.map((item) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            product: {
              name: item.product.name,
              price: parseFloat(item.product.price),
              image: item.product.images[0]?.url,
            },
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
