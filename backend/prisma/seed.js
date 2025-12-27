// Database Seed Script for Nashiecom Technologies
// Populates the database with initial data including admin user and products

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");

const prisma = new PrismaClient();

// Categories data
const categoriesData = [
  {
    name: "Laptops",
    icon: "💻",
    description: "High-performance laptops for work and gaming",
  },
  { name: "Desktops", icon: "🖥️", description: "Powerful desktop computers" },
  {
    name: "Monitors",
    icon: "📺",
    description: "Premium displays for professionals and gamers",
  },
  {
    name: "Accessories",
    icon: "🎧",
    description: "Keyboards, mice, headsets, and more",
  },
];

const subcategoriesData = {
  Laptops: ["Gaming", "Professional", "Ultrabook", "Business"],
  Desktops: ["Gaming", "Workstation", "Office"],
  Monitors: ["Gaming", "Ultrawide", "Professional"],
  Accessories: ["Keyboards", "Mice", "Headsets", "Bags", "Adapters", "Docks"],
};

// Products data (from frontend)
const productsData = [
  {
    name: "ASUS ROG Strix G16",
    category: "Laptops",
    subcategory: "Gaming",
    price: 1899000.99,
    originalPrice: 2199000.99,
    rating: 4.8,
    reviews: 245,
    images: [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
    ],
    inStock: true,
    featured: true,
    description:
      "High-performance gaming laptop with latest Gen Intel processor and RTX graphics",
    specs: {
      processor: "Intel Core i9-13980HX",
      graphics: "NVIDIA RTX 4070 8GB",
      ram: "32GB DDR5",
      storage: "1TB NVMe SSD",
      display: '16" QHD 240Hz',
    },
  },
  {
    name: 'MacBook Pro 16"',
    category: "Laptops",
    subcategory: "Professional",
    price: 2499000.99,
    originalPrice: 2699000.99,
    rating: 4.9,
    reviews: 512,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
      "https://images.unsplash.com/photo-1611186871348-b1ec696e523f?w=800",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800",
    ],
    inStock: true,
    featured: true,
    description:
      "Professional laptop with Apple M3 Max chip for creative professionals",
    specs: {
      processor: "Apple M3 Max",
      graphics: "M3 Max 40-core GPU",
      ram: "64GB Unified",
      storage: "2TB SSD",
      display: '16.2" Liquid Retina XDR',
    },
  },
  {
    name: "Dell XPS 15",
    category: "Laptops",
    subcategory: "Ultrabook",
    price: 1599000.99,
    originalPrice: 1799000.99,
    rating: 4.7,
    reviews: 389,
    images: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500",
    ],
    description: "Premium ultrabook with OLED display, Intel Core i7, 32GB RAM",
    specs: {
      processor: "Intel Core i7-13700H",
      graphics: "NVIDIA RTX 4060 6GB",
      ram: "32GB DDR5",
      storage: "1TB NVMe SSD",
      display: '15.6" 3.5K OLED',
    },
    inStock: true,
    featured: false,
  },
  {
    name: "Lenovo ThinkPad X1 Carbon",
    category: "Laptops",
    subcategory: "Business",
    price: 1449000.99,
    originalPrice: 1649000.99,
    rating: 4.6,
    reviews: 278,
    images: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500",
    ],
    description:
      'Ultra-light business laptop with Intel vPro, 14" 2.8K display',
    specs: {
      processor: "Intel Core i7-1365U vPro",
      graphics: "Intel Iris Xe",
      ram: "16GB LPDDR5",
      storage: "512GB SSD",
      display: '14" 2.8K OLED',
    },
    inStock: true,
    featured: false,
  },
  {
    name: "Nashiecom Titan Pro",
    category: "Desktops",
    subcategory: "Gaming",
    price: 2999000.99,
    originalPrice: 3299000.99,
    rating: 4.9,
    reviews: 156,
    images: [
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800",
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800",
      "https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=800",
    ],
    inStock: true,
    featured: true,
    description: "Ultimate gaming desktop with RTX 4090 and liquid cooling",
    specs: {
      processor: "Intel Core i9-14900K",
      graphics: "NVIDIA RTX 4090 24GB",
      ram: "64GB DDR5",
      storage: "2TB NVMe SSD",
      cooling: "360mm AIO Liquid",
    },
  },
  {
    name: "Nashiecom Workstation X",
    category: "Desktops",
    subcategory: "Workstation",
    price: 3499000.99,
    originalPrice: 3899000.99,
    rating: 4.8,
    reviews: 89,
    images: [
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500",
    ],
    description: "Professional workstation for 3D rendering and video editing",
    specs: {
      processor: "AMD Ryzen 9 7950X",
      graphics: "NVIDIA RTX 4090 24GB",
      ram: "128GB DDR5",
      storage: "4TB NVMe SSD",
      cooling: "360mm AIO Liquid",
    },
    inStock: true,
    featured: false,
  },
  {
    name: "Nashiecom Office Plus",
    category: "Desktops",
    subcategory: "Office",
    price: 799000.99,
    originalPrice: 899000.99,
    rating: 4.5,
    reviews: 234,
    images: [
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500",
    ],
    description: "Reliable office desktop for everyday productivity",
    specs: {
      processor: "Intel Core i5-13400",
      graphics: "Intel UHD 730",
      ram: "16GB DDR4",
      storage: "512GB SSD",
      wifi: "Wi-Fi 6",
    },
    inStock: true,
    featured: false,
  },
  {
    name: 'LG UltraGear 27" 4K',
    category: "Monitors",
    subcategory: "Gaming",
    price: 699000.99,
    originalPrice: 799000.99,
    rating: 4.7,
    reviews: 423,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
      "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800",
      "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=800",
    ],
    inStock: true,
    featured: true,
    description: '27" 4K Gaming monitor with 144Hz refresh rate and HDR',
    specs: {
      size: "27 inches",
      resolution: "3840 x 2160",
      refreshRate: "144Hz",
      panelType: "Nano IPS",
      responseTime: "1ms",
    },
  },
  {
    name: "Samsung Odyssey G9",
    category: "Monitors",
    subcategory: "Ultrawide",
    price: 1299000.99,
    originalPrice: 1499000.99,
    rating: 4.8,
    reviews: 189,
    images: [
      "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=500",
    ],
    description: '49" Super Ultrawide curved gaming monitor',
    specs: {
      size: "49 inches",
      resolution: "5120 x 1440",
      refreshRate: "240Hz",
      panelType: "VA Curved",
      responseTime: "1ms",
    },
    inStock: true,
    featured: false,
  },
  {
    name: 'Dell UltraSharp 32" 4K',
    category: "Monitors",
    subcategory: "Professional",
    price: 899000.99,
    originalPrice: 999000.99,
    rating: 4.9,
    reviews: 312,
    images: ["https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=500"],
    description: '32" 4K USB-C Hub monitor for professionals',
    specs: {
      size: "32 inches",
      resolution: "3840 x 2160",
      colorAccuracy: "100% sRGB, 98% DCI-P3",
      panelType: "IPS Black",
      connectivity: "USB-C 90W",
    },
    inStock: true,
    featured: false,
  },
  {
    name: "Logitech G Pro X",
    category: "Accessories",
    subcategory: "Keyboards",
    price: 149000.99,
    originalPrice: 179000.99,
    rating: 4.7,
    reviews: 567,
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500",
    ],
    description:
      "Pro-grade TKL mechanical keyboard with hot-swappable switches",
    specs: {
      type: "Mechanical TKL",
      switches: "GX Red (Hot-Swap)",
      lighting: "LIGHTSYNC RGB",
      connection: "USB-C Detachable",
    },
    inStock: true,
    featured: false,
  },
  {
    name: "Keychron Q1 Pro",
    category: "Accessories",
    subcategory: "Keyboards",
    price: 199000.99,
    originalPrice: 229000.99,
    rating: 4.8,
    reviews: 234,
    images: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500",
    ],
    description: "Premium wireless mechanical keyboard with QMK/VIA support",
    specs: {
      type: "75% Mechanical",
      switches: "Gateron G Pro",
      lighting: "South-facing RGB",
      connection: "Bluetooth 5.1 / USB-C",
    },
    inStock: true,
    featured: true,
  },
  {
    name: "Logitech G Pro X Superlight 2",
    category: "Accessories",
    subcategory: "Mice",
    price: 159000.99,
    originalPrice: 179000.99,
    rating: 4.9,
    reviews: 789,
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
    ],
    description: "Ultra-lightweight wireless gaming mouse (60g)",
    specs: {
      sensor: "HERO 2",
      dpi: "32,000 DPI",
      weight: "60g",
      battery: "95 hours",
    },
    inStock: true,
    featured: false,
  },
  {
    name: "Razer DeathAdder V3 Pro",
    category: "Accessories",
    subcategory: "Mice",
    price: 149000.99,
    originalPrice: 169000.99,
    rating: 4.8,
    reviews: 456,
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500",
    ],
    description: "Ergonomic wireless gaming mouse with Focus Pro 30K sensor",
    specs: {
      sensor: "Focus Pro 30K",
      dpi: "30,000 DPI",
      weight: "64g",
      battery: "90 hours",
    },
    inStock: true,
    featured: false,
  },
  {
    name: "SteelSeries Arctis Nova Pro",
    category: "Accessories",
    subcategory: "Headsets",
    price: 349000.99,
    originalPrice: 399000.99,
    rating: 4.8,
    reviews: 345,
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500",
    ],
    description: "Premium wireless gaming headset with ANC",
    specs: {
      drivers: "40mm Neodymium",
      anc: "4-mic Hybrid ANC",
      battery: "22 hours",
      connection: "2.4GHz / Bluetooth",
    },
    inStock: true,
    featured: true,
  },
  {
    name: "Peak Design Everyday Backpack",
    category: "Accessories",
    subcategory: "Bags",
    price: 289000.99,
    originalPrice: 299000.99,
    rating: 4.9,
    reviews: 678,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"],
    description: "Premium laptop backpack with weatherproof design",
    specs: {
      capacity: "30L",
      laptopSize: 'Up to 16"',
      material: "Recycled Nylon",
      waterproof: "DWR Coating",
    },
    inStock: true,
    featured: false,
  },
  {
    name: "Anker USB-C Hub 8-in-1",
    category: "Accessories",
    subcategory: "Adapters",
    price: 69000.99,
    originalPrice: 79000.99,
    rating: 4.6,
    reviews: 1234,
    images: [
      "https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=500",
    ],
    description: "8-in-1 USB-C hub with 4K HDMI and 100W Power Delivery",
    specs: {
      ports: "8 Ports",
      hdmi: "4K@60Hz",
      powerDelivery: "100W",
      cardReader: "SD/microSD",
    },
    inStock: true,
    featured: false,
  },
  {
    name: "Belkin Thunderbolt 4 Dock",
    category: "Accessories",
    subcategory: "Docks",
    price: 349000.99,
    originalPrice: 399000.99,
    rating: 4.7,
    reviews: 189,
    images: [
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500",
    ],
    description: "Professional Thunderbolt 4 docking station",
    specs: {
      ports: "12 Ports",
      displays: "Dual 4K@60Hz",
      charging: "90W Laptop Charging",
      speed: "40Gbps",
    },
    inStock: true,
    featured: false,
  },
];

// Settings data
const settingsData = [
  {
    key: "store_name",
    value: "Nashiecom Technologies",
    type: "string",
    group: "general",
  },
  {
    key: "store_email",
    value: "sales@nashiecom.tech",
    type: "string",
    group: "general",
  },
  {
    key: "store_phone",
    value: "+1 (555) 123-4567",
    type: "string",
    group: "general",
  },
  {
    key: "store_address",
    value: "New Pioneer Mall near Mapeera House, Kampala, Uganda",
    type: "string",
    group: "general",
  },
  { key: "currency", value: "UGX", type: "string", group: "general" },
  { key: "currency_symbol", value: "UGX", type: "string", group: "general" },
  { key: "tax_rate", value: "8", type: "number", group: "checkout" },
  {
    key: "free_shipping_threshold",
    value: "500000",
    type: "number",
    group: "checkout",
  },
  {
    key: "default_shipping_fee",
    value: "25000",
    type: "number",
    group: "checkout",
  },
];

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clean existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productSpec.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.setting.deleteMany();

  // Create admin user
  console.log("👤 Creating admin user...");
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "Admin@123456",
    12
  );
  const admin = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || "admin@nashiecom.tech",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "SUPER_ADMIN",
      emailVerified: true,
      isActive: true,
    },
  });
  console.log(`   ✓ Admin created: ${admin.email}`);

  // Create categories and subcategories
  console.log("📁 Creating categories...");
  const categoryMap = {};

  for (const cat of categoriesData) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        slug: slugify(cat.name, { lower: true }),
        icon: cat.icon,
        description: cat.description,
        isActive: true,
      },
    });
    categoryMap[cat.name] = category;
    console.log(`   ✓ Category: ${cat.name}`);

    // Create subcategories
    if (subcategoriesData[cat.name]) {
      for (const subName of subcategoriesData[cat.name]) {
        // Make subcategory name unique by prefixing with parent
        const uniqueSubName = `${cat.name} - ${subName}`;
        const subcat = await prisma.category.create({
          data: {
            name: uniqueSubName,
            slug: slugify(`${cat.name}-${subName}`, { lower: true }),
            parentId: category.id,
            isActive: true,
          },
        });
        categoryMap[`${cat.name}-${subName}`] = subcat;
        console.log(`      ✓ Subcategory: ${subName}`);
      }
    }
  }

  // Create products
  console.log("📦 Creating products...");
  for (const prod of productsData) {
    const categoryKey = prod.subcategory
      ? `${prod.category}-${prod.subcategory}`
      : prod.category;
    const category = categoryMap[categoryKey] || categoryMap[prod.category];

    if (!category) {
      console.log(`   ⚠ Category not found for: ${prod.name}`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        name: prod.name,
        slug: slugify(prod.name, { lower: true, strict: true }),
        description: prod.description,
        price: prod.price,
        originalPrice: prod.originalPrice,
        rating: prod.rating,
        reviewCount: prod.reviews,
        inStock: prod.inStock,
        featured: prod.featured,
        quantity: Math.floor(Math.random() * 50) + 10,
        categoryId: category.id,
        isActive: true,
      },
    });

    // Add images
    for (let i = 0; i < prod.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: prod.images[i],
          isPrimary: i === 0,
          sortOrder: i,
        },
      });
    }

    // Add specs
    if (prod.specs) {
      let sortOrder = 0;
      for (const [name, value] of Object.entries(prod.specs)) {
        await prisma.productSpec.create({
          data: {
            productId: product.id,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: value,
            sortOrder: sortOrder++,
          },
        });
      }
    }

    console.log(`   ✓ Product: ${prod.name}`);
  }

  // Create settings
  console.log("⚙️  Creating settings...");
  for (const setting of settingsData) {
    await prisma.setting.create({
      data: setting,
    });
  }
  console.log(`   ✓ ${settingsData.length} settings created`);

  // Create sample coupon
  console.log("🎟️  Creating sample coupon...");
  await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      description: "10% off for new customers",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 100000,
      usageLimit: 100,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });
  console.log("   ✓ Coupon WELCOME10 created");

  console.log("\n✅ Database seeding completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - Admin user: ${admin.email}`);
  console.log(`   - Categories: ${Object.keys(categoryMap).length}`);
  console.log(`   - Products: ${productsData.length}`);
  console.log(`   - Settings: ${settingsData.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
