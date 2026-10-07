import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import apiError from "./apiError.js";

const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUDNAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new apiError(
      500,
      "Cloudinary is not configured. Set CLOUDINARY_CLOUDNAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in server/.env and restart the server."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
};

export const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) throw new apiError(404, "file not found");
    configureCloudinary();

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
    configureCloudinary();

    const deletedFile = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type || "auto",
    });
    if (!deletedFile) throw new apiError(500, "Error deleting file");
    return deletedFile;
  } catch (error) {
    console.error("Error deleting files", error);
    return null;
  }
};

export const deleteBulk = async (publicIds = []) => {
  try {
    if (publicIds.length <= 0) return null;
    configureCloudinary();
    const deleteFiles = await cloudinary.api.delete_resources(publicIds);
    if (!deleteFiles) throw new apiError(500, "Cloudinary deletion errror");
  } catch (error) {
    console.error("Cloudinary Bulk Delete Error:", error);
  }
};
