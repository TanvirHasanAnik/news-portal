/**
 * Client-Side Image to WebP Converter Utility
 * Converts and compresses any user-selected image to WebP using the HTML5 Canvas API
 * before uploading to Cloudflare R2 storage.
 *
 * @param {File|Blob} file - The original image file selected by the user
 * @param {number} [quality=0.82] - Compression quality from 0.0 to 1.0 (default 0.82)
 * @param {number} [maxDimension=2560] - Optional maximum width or height for downsizing massive camera photos
 * @returns {Promise<File>} - Resolves with the optimized WebP File object
 */
export function convertImageToWebP(file, quality = 0.82, maxDimension = 2560) {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof Blob)) {
      return reject(new TypeError("A valid File or Blob object is required."));
    }

    // Skip vector SVGs or files that don't need raster conversion
    if (file.type === "image/svg+xml") {
      return resolve(file);
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("ইমেজ ফাইলটি রিড করতে ব্যর্থ হয়েছে।"));
    };

    reader.onload = (event) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error("ব্রাউজারে ছবিটি লোড করা যায়নি। ফাইলটি ক্ষতিগ্রস্ত হতে পারে।"));
      };

      img.onload = () => {
        try {
          let { naturalWidth: width, naturalHeight: height } = img;

          // Downscale if image exceeds maxDimension while preserving aspect ratio
          if (maxDimension && (width > maxDimension || height > maxDimension)) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          // Create canvas and draw image
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d", { alpha: true });
          if (!ctx) {
            return reject(new Error("Canvas 2D context পাওয়া যায়নি।"));
          }

          // Smooth scaling for high visual fidelity
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Export as WebP blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                // In rare cases if browser canvas.toBlob fails, fallback to original
                return resolve(file);
              }

              // Derive new filename with .webp extension
              const originalName = file.name || "image";
              const baseName = originalName.replace(/\.[^/.]+$/, "");
              const webpFileName = `${baseName}.webp`;

              const webpFile = new File([blob], webpFileName, {
                type: "image/webp",
                lastModified: Date.now(),
              });

              resolve(webpFile);
            },
            "image/webp",
            quality
          );
        } catch (err) {
          reject(err);
        }
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}

