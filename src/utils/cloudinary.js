import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import apiError from "./apiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) throw new apiError(404, "file not found");

    const uploadedFile = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    if (!uploadedFile) throw new apiError(500, "Error uploading file");
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return uploadedFile;
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new apiError(500, error.message || "Error uploading file");
  }
};

export const deleteOnCloudinary = async (public_id, resource_type) => {
  try {
    if (!public_id) return null;

    const deletedFile = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type,
    });
    if (!deletedFile) throw new apiError(500, "Error deleting file");
    return deletedFile;
  } catch (error) {
    throw new apiError(500, error.message || "Error deleting file");
  }
};
