import { Wishlist, type IWishlist } from "../models/Wishlist";
import { Product } from "../models/Product";
import { ApiError, notFound } from "../utils/ApiError";

async function getOrCreateWishlist(userId: string): Promise<IWishlist> {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });
  return wishlist;
}

export async function getWishlistService(userId: string) {
  const wishlist = await getOrCreateWishlist(userId);
  const products = await Product.find({ _id: { $in: wishlist.products } })
    .populate("brand", "name slug")
    .populate("category", "name slug")
    .lean();
  const now = new Date();
  const data = {
    ids: wishlist.products.map((p) => p.toString()),
    products,
    count: wishlist.products.length,
    priceDrops: products.filter((p) => p.offerPrice && p.offerPrice < p.price).length,
  };
  void now;
  return data;
}

export async function addToWishlistService(userId: string, productId: string) {
  const product = await Product.findById(productId).select("published").lean();
  if (!product || !product.published) throw notFound("Product not found");
  const wishlist = await getOrCreateWishlist(userId);
  if (!wishlist.products.some((p) => p.toString() === productId)) {
    wishlist.products.push(productId as never);
    await wishlist.save();
  }
  return getWishlistService(userId);
}

export async function removeFromWishlistService(userId: string, productId: string) {
  const wishlist = await getOrCreateWishlist(userId);
  wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
  await wishlist.save();
  return getWishlistService(userId);
}

export async function moveToCartService(userId: string, productId: string) {
  const product = await Product.findById(productId).select("stock published name").lean();
  if (!product || !product.published) throw notFound("Product not found");
  if (product.stock <= 0) throw new ApiError(400, `"${product.name}" is out of stock`);
  return removeFromWishlistService(userId, productId);
}