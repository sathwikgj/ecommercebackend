const prisma = require("../prisma/client");

exports.getProducts = async (req, res) => {
  try {
    const { search, categoryId, minPrice, maxPrice } = req.query;

    let where = {};
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice || maxPrice) {
      where.variants = {
        some: {
          price: {
            gte: minPrice ? Number(minPrice) : undefined,
            lte: maxPrice ? Number(maxPrice) : undefined,
          },
        },
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: true,
        images: true,
        category: true,
      },
    });

    res.json(products);

  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }

};

exports.createProduct = async (req, res) => {
  try {
    const { title, description, categoryId, variants, images } = req.body;
    if (!title || !description || !categoryId || !variants || !images){
      return res.status(400).json({ message: "Enter all the details" });
    }


    const product = await prisma.product.create({
      data: {
        title,
        description,
        categoryId,
        variants,
        images,
      },
    });

    res.status(201).json(product);

  } catch (err) {
    res.status(500).json({ message: "Error creating product" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(product);

  } catch (err) {
    res.status(500).json({ message: "Error updating product" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Product deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting product" });
  }
};