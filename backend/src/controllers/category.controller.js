// Category Controller
const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const slugify = require("slugify");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res, next) => {
  try {
    const { includeProducts, parentOnly } = req.query;

    const where = { isActive: true };

    if (parentOnly === "true") {
      where.parentId = null;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category tree (hierarchical)
// @route   GET /api/categories/tree
// @access  Public
exports.getCategoryTree = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        children: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { isActive: true },
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return next(new AppError("Category not found", 404));
    }

    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { isActive: true },
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return next(new AppError("Category not found", 404));
    }

    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products in category
// @route   GET /api/categories/:id/products
// @access  Public
exports.getCategoryProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get category and its children
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: { select: { id: true } },
      },
    });

    if (!category) {
      return next(new AppError("Category not found", 404));
    }

    // Include products from this category and its children
    const categoryIds = [id, ...category.children.map((c) => c.id)];

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          categoryId: { in: categoryIds },
        },
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: "asc" } },
        },
      }),
      prisma.product.count({
        where: {
          isActive: true,
          categoryId: { in: categoryIds },
        },
      }),
    ]);

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
        category,
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

// @desc    Create category
// @route   POST /api/categories
// @access  Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, image, parentId, sortOrder } = req.body;

    // Generate unique slug
    let slug = slugify(name, { lower: true, strict: true });
    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        image,
        parentId,
        sortOrder: sortOrder || 0,
      },
      include: {
        parent: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, icon, image, parentId, sortOrder, isActive } =
      req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return next(new AppError("Category not found", 404));
    }

    // Update slug if name changed
    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = slugify(name, { lower: true, strict: true });
      const existingSlug = await prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Prevent setting self as parent
    if (parentId === id) {
      return next(new AppError("Category cannot be its own parent", 400));
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        icon,
        image,
        parentId,
        sortOrder,
        isActive,
      },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check for products in this category
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return next(
        new AppError(
          `Cannot delete category with ${productCount} products. Move or delete products first.`,
          400
        )
      );
    }

    // Check for child categories
    const childCount = await prisma.category.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      return next(
        new AppError(
          `Cannot delete category with ${childCount} subcategories. Delete subcategories first.`,
          400
        )
      );
    }

    await prisma.category.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle category status
// @route   PATCH /api/categories/:id/toggle-status
// @access  Admin
exports.toggleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return next(new AppError("Category not found", 404));
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });

    res.status(200).json({
      success: true,
      data: { category: updated },
    });
  } catch (error) {
    next(error);
  }
};
