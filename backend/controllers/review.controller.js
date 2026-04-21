const prisma = require("../prisma/client");

exports.getReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

exports.getReview = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: "Error fetching review" });
  }
}

exports.createReview = async (req, res) => {
  try {
    const review = await prisma.review.create({
      data: req.body,
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: "Error creating review" });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: "Error updating review status" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await prisma.review.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting review" });
  }
};  
