const prisma = require("../config/database");

/**
 * @desc    Global Search (Products & Categories)
 * @route   GET /api/search
 * @access  Public
 */
exports.globalSearch = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
          categories: [],
        },
      });
    }

    const [products, categories] = await Promise.all([
      // Search Products
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        },
        take: parseInt(limit),
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true },
          },
          category: {
            select: { name: true, slug: true },
          },
        },
      }),
      // Search Categories
      prisma.category.findMany({
        where: {
          isActive: true,
          name: { contains: q, mode: "insensitive" },
        },
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          _count: {
            select: { products: true },
          },
        },
      }),
    ]);

    // Format products
    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: parseFloat(p.price),
      image: p.images[0]?.url,
      category: p.category?.name,
      type: "product",
    }));

    // Format categories
    const formattedCategories = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      productCount: c._count.products,
      type: "category",
    }));

    res.status(200).json({
      success: true,
      data: {
        products: formattedProducts,
        categories: formattedCategories,
        total: formattedProducts.length + formattedCategories.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
