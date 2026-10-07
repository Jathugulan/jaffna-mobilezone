import { Address } from "../models/Address";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/response";
import { notFound } from "../utils/ApiError";
import type { AuthedRequest } from "../types/express";
import mongoose from "mongoose";

export const listAddresses = asyncHandler(async (req: AuthedRequest, res) => {
  const addresses = await Address.find({ user: req.user!.id }).sort({ isDefault: -1, createdAt: -1 });
  return success(res, { addresses });
});

export const createAddress = asyncHandler(async (req: AuthedRequest, res) => {
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;
  const userId = new mongoose.Types.ObjectId(req.user!.id);

  if (body.isDefault) {
    await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
  }

  const address = await Address.create({ ...body, user: userId });
  await User.updateOne({ _id: userId }, { $addToSet: { addresses: address._id } });
  if (body.isDefault) {
    await User.updateOne({ _id: userId }, { $set: { defaultAddress: address._id } });
  }

  return success(res, { address }, undefined, 201);
});

export const updateAddress = asyncHandler(async (req: AuthedRequest, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user!.id });
  if (!address) throw notFound("Address not found");
  const body = (req as unknown as { validated: { body: Record<string, unknown> } }).validated.body;

  if (body.isDefault) {
    await Address.updateMany({ user: req.user!.id }, { $set: { isDefault: false } });
  }
  Object.assign(address, body);
  await address.save();
  if (body.isDefault) {
    await User.updateOne({ _id: req.user!.id }, { $set: { defaultAddress: address._id } });
  }
  return success(res, { address });
});

export const deleteAddress = asyncHandler(async (req: AuthedRequest, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user!.id });
  if (!address) throw notFound("Address not found");
  await address.deleteOne();
  await User.updateOne({ _id: req.user!.id }, { $pull: { addresses: address._id } });
  return success(res, { message: "Address deleted" });
});

export const setDefaultAddress = asyncHandler(async (req: AuthedRequest, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user!.id });
  if (!address) throw notFound("Address not found");
  await Address.updateMany({ user: req.user!.id }, { $set: { isDefault: false } });
  address.isDefault = true;
  await address.save();
  await User.updateOne({ _id: req.user!.id }, { $set: { defaultAddress: address._id } });
  return success(res, { address });
});