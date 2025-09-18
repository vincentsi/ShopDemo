// Convert file to base64 for temporary storage
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Upload single image (temporary solution using base64)
export const uploadImage = async (file) => {
  try {
    const base64 = await fileToBase64(file);
    return {
      success: true,
      data: {
        url: base64,
        publicId: `temp_${Date.now()}`,
        width: 0,
        height: 0,
        format: file.type.split("/")[1],
        size: file.size,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de la conversion de l'image",
    };
  }
};

// Upload multiple images (temporary solution using base64)
export const uploadImages = async (files) => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file));
    const results = await Promise.all(uploadPromises);

    const successfulUploads = results.filter((result) => result.success);

    if (successfulUploads.length === 0) {
      return {
        success: false,
        message: "Aucune image n'a pu être uploadée",
      };
    }

    return {
      success: true,
      data: {
        images: successfulUploads.map((result) => result.data),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de l'upload des images",
    };
  }
};

// Delete image (not needed for base64 storage)
export const deleteImage = async (publicId) => {
  return {
    success: true,
    message: "Image supprimée (stockage temporaire)",
  };
};
