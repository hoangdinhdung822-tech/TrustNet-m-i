/**
 * Utility hỗ trợ chọn và nén ảnh từ thiết bị cá nhân (điện thoại, máy tính)
 * Tối ưu hóa kích thước phù hợp làm Avatar và lưu trữ an toàn trong LocalStorage.
 */
export const processDeviceImage = (
  file: File, 
  maxWidth: number = 360, 
  maxHeight: number = 360, 
  quality: number = 0.88
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Tệp đã chọn không phải là hình ảnh hợp lệ (chấp nhận JPG, PNG, WEBP, GIF).'));
      return;
    }

    // Giới hạn dung lượng tệp gốc không vượt quá 20MB
    if (file.size > 20 * 1024 * 1024) {
      reject(new Error('Kích thước ảnh quá lớn (vui lòng chọn ảnh dưới 20MB).'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        reject(new Error('Không thể đọc dữ liệu tệp hình ảnh.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Tính toán tỉ lệ khung hình vuông (Avatar square crop hoặc fit)
        const minDim = Math.min(width, height);
        const cropX = (width - minDim) / 2;
        const cropY = (height - minDim) / 2;

        const targetDim = Math.min(minDim, maxWidth);

        const canvas = document.createElement('canvas');
        canvas.width = targetDim;
        canvas.height = targetDim;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }

        // Bật làm mịn ảnh
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Cắt vuông tâm ảnh (Center square crop) để avatar luôn cân đối
        ctx.drawImage(
          img,
          cropX, cropY, minDim, minDim,
          0, 0, targetDim, targetDim
        );

        // Xuất data URL chuẩn JPEG
        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(result);
        }
      };

      img.onerror = () => {
        resolve(result);
      };

      img.src = result;
    };

    reader.onerror = () => {
      reject(new Error('Đã xảy ra lỗi khi đọc tệp từ thiết bị của bạn.'));
    };

    reader.readAsDataURL(file);
  });
};
