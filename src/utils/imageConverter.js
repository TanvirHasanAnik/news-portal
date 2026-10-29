


export function convertImageToWebP(file, quality = 0.82, maxDimension = 2560) {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof Blob)) {
      return reject(new TypeError("A valid File or Blob object is required."));
    }


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


          if (maxDimension && (width > maxDimension || height > maxDimension)) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }


          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d", { alpha: true });
          if (!ctx) {
            return reject(new Error("Canvas 2D context পাওয়া যায়নি।"));
          }


          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);


          canvas.toBlob(
            (blob) => {
              if (!blob) {

                return resolve(file);
              }


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

