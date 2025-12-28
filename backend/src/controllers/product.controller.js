// Product Controller
const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const slugify = require("slugify");
const { invalidateProductCache } = require("../utils/cache");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      search,
      minPrice,
      maxPrice,
      featured,
      inStock,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = { isActive: true };

    if (category) {
      where.category = {
        OR: [
          { slug: category.toLowerCase() },
          { name: { equals: category, mode: "insensitive" } },
        ],
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice) {
      where.price = { ...where.price, gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) };
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (inStock === "true") {
      where.inStock = true;
    }

    // Build orderBy
    let orderBy = {};
    switch (sortBy) {
      case "price-low":
        orderBy = { price: "asc" };
        break;
      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      default:
        orderBy = { [sortBy]: sortOrder };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { sortOrder: "asc" },
          },
          specs: {
            orderBy: { sortOrder: "asc" },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Format products with primary image
    const formattedProducts = products.map((product) => ({
      ...product,
      image:
        product.images.find((img) => img.isPrimary)?.url ||
        product.images[0]?.url,
      price: parseFloat(product.price),
      originalPrice: product.originalPrice
        ? parseFloat(product.originalPrice)
        : null,
      rating: parseFloat(product.rating),
    }));

    res.status(200).json({
      success: true,
      data: {
        products: formattedProducts,
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

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const products = await prisma.product.findMany({
      where: { isActive: true, featured: true },
      take: parseInt(limit),
      orderBy: { rating: "desc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    const formattedProducts = products.map((product) => ({
      ...product,
      image:
        product.images.find((img) => img.isPrimary)?.url ||
        product.images[0]?.url,
      price: parseFloat(product.price),
      originalPrice: product.originalPrice
        ? parseFloat(product.originalPrice)
        : null,
      rating: parseFloat(product.rating),
    }));

    res.status(200).json({
      success: true,
      data: { products: formattedProducts },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: { products: [] },
      });
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      take: parseInt(limit),
      include: {
        category: {
          select: { name: true, slug: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.price),
      image: product.images[0]?.url,
      category: product.category.name,
    }));

    res.status(200).json({
      success: true,
      data: { products: formattedProducts },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID or Slug
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if ID is a valid UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(id);

    const product = await prisma.product.findUnique({
      where: isUuid ? { id } : { slug: id },
      include: {
        category: {
          include: {
            parent: { select: { id: true, name: true, slug: true } },
          },
        },
        images: { orderBy: { sortOrder: "asc" } },
        specs: { orderBy: { sortOrder: "asc" } },
        reviews: {
          where: { isApproved: true },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { firstName: true, lastName: true, avatar: true },
            },
          },
        },
      },
    });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    // Track page view
    if (req.headers["x-session-id"]) {
      prisma.pageView
        .create({
          data: {
            page: `/products/${id}`,
            productId: id,
            sessionId: req.headers["x-session-id"],
            userAgent: req.headers["user-agent"],
          },
        })
        .catch(() => {}); // Don't fail if analytics fails
    }

    const formattedProduct = {
      ...product,
      image:
        product.images.find((img) => img.isPrimary)?.url ||
        product.images[0]?.url,
      price: parseFloat(product.price),
      originalPrice: product.originalPrice
        ? parseFloat(product.originalPrice)
        : null,
      rating: parseFloat(product.rating),
    };

    res.status(200).json({
      success: true,
      data: { product: formattedProduct },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
exports.getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          include: {
            parent: { select: { id: true, name: true, slug: true } },
          },
        },
        images: { orderBy: { sortOrder: "asc" } },
        specs: { orderBy: { sortOrder: "asc" } },
        reviews: {
          where: { isApproved: true },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { firstName: true, lastName: true, avatar: true },
            },
          },
        },
      },
    });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    const formattedProduct = {
      ...product,
      image:
        product.images.find((img) => img.isPrimary)?.url ||
        product.images[0]?.url,
      price: parseFloat(product.price),
      originalPrice: product.originalPrice
        ? parseFloat(product.originalPrice)
        : null,
      rating: parseFloat(product.rating),
    };

    res.status(200).json({
      success: true,
      data: { product: formattedProduct },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Admin
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      originalPrice,
      costPrice,
      sku,
      barcode,
      quantity,
      categoryId,
      featured,
      images,
      specs,
      weight,
      dimensions,
    } = req.body;

    // Generate unique slug
    let slug = slugify(name, { lower: true, strict: true });
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        price,
        originalPrice,
        costPrice,
        sku,
        barcode,
        quantity: quantity || 0,
        categoryId,
        featured: featured || false,
        weight,
        dimensions,
        inStock: (quantity || 0) > 0,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    // Add images
    if (images && images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((img, index) => ({
          productId: product.id,
          url: img.url,
          alt: img.alt || name,
          isPrimary: index === 0,
          sortOrder: index,
        })),
      });
    }

    // Add specs
    if (specs && specs.length > 0) {
      await prisma.productSpec.createMany({
        data: specs.map((spec, index) => ({
          productId: product.id,
          name: spec.name,
          value: spec.value,
          sortOrder: index,
        })),
      });
    }

    // Fetch complete product
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        specs: { orderBy: { sortOrder: "asc" } },
      },
    });

    res.status(201).json({
      success: true,
      data: { product: completeProduct },
    });

    // Invalidate cache after successful creation
    invalidateProductCache();
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      shortDescription,
      price,
      originalPrice,
      costPrice,
      sku,
      barcode,
      quantity,
      categoryId,
      featured,
      isActive,
      inStock,
      weight,
      dimensions,
      metaTitle,
      metaDescription,
      specs,
      images,
    } = req.body;

    // Check if product exists
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return next(new AppError("Product not found", 404));
    }

    // Update slug if name changed
    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = slugify(name, { lower: true, strict: true });
      const existingSlug = await prisma.product.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Calculate inStock based on quantity
    const finalInStock =
      quantity !== undefined
        ? quantity > 0
        : inStock !== undefined
        ? inStock
        : existing.inStock;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        shortDescription,
        price,
        originalPrice,
        costPrice,
        sku,
        barcode,
        quantity,
        categoryId,
        featured,
        isActive,
        inStock: finalInStock,
        weight,
        dimensions,
        metaTitle,
        metaDescription,
      },
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        specs: { orderBy: { sortOrder: "asc" } },
      },
    });

    // Update specs if provided
    if (specs) {
      await prisma.productSpec.deleteMany({ where: { productId: id } });
      await prisma.productSpec.createMany({
        data: specs.map((spec, index) => ({
          productId: id,
          name: spec.name,
          value: spec.value,
          sortOrder: index,
        })),
      });
    }

    // Update images if provided
    if (images && Array.isArray(images)) {
      // Delete existing images
      await prisma.productImage.deleteMany({ where: { productId: id } });
      // Create new images
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img, index) => ({
            productId: id,
            url: img.url,
            alt: img.alt || name || existing.name,
            isPrimary: img.isPrimary || index === 0,
            sortOrder: index,
          })),
        });
      }
    }

    // Fetch updated product with all relations
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        specs: { orderBy: { sortOrder: "asc" } },
      },
    });

    res.status(200).json({
      success: true,
      data: { product: updatedProduct },
    });

    // Invalidate cache after successful update
    invalidateProductCache();
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

    // Invalidate cache after successful deletion
    invalidateProductCache();
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product featured status
// @route   PATCH /api/products/:id/toggle-featured
// @access  Admin
exports.toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { featured: !product.featured },
    });

    res.status(200).json({
      success: true,
      data: { product: updated },
    });

    // Invalidate cache after toggling featured
    invalidateProductCache();
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product active status
// @route   PATCH /api/products/:id/toggle-status
// @access  Admin
exports.toggleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });

    res.status(200).json({
      success: true,
      data: { product: updated },
    });

    // Invalidate cache after toggling status
    invalidateProductCache();
  } catch (error) {
    next(error);
  }
};

// @desc    Add product images
// @route   POST /api/products/:id/images
// @access  Admin
exports.addProductImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { images } = req.body;

    if (!images || !Array.isArray(images)) {
      return next(new AppError("Images array is required", 400));
    }

    // Get current max sort order
    const lastImage = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { sortOrder: "desc" },
    });

    const startOrder = lastImage ? lastImage.sortOrder + 1 : 0;

    await prisma.productImage.createMany({
      data: images.map((img, index) => ({
        productId: id,
        url: img.url,
        alt: img.alt,
        isPrimary: false,
        sortOrder: startOrder + index,
      })),
    });

    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    res.status(200).json({
      success: true,
      data: { images: product.images },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Admin
exports.deleteProductImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;

    await prisma.productImage.delete({
      where: { id: imageId, productId: id },
    });

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
