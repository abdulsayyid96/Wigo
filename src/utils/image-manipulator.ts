import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

export interface ProcessedImageResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

/**
 * Gets image dimensions via Promise wrapper around React Native's Image.getSize.
 */
function getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (err) => reject(err)
    );
  });
}

/**
 * Automatically resize and compress image to a max width (default 1200px),
 * preserving aspect ratio. Only downscales if width > maxWidth.
 * Outputs JPEG format with 0.85 compression quality.
 */
export async function capImageResolution(
  uri: string,
  options: {
    maxWidth?: number;
    compress?: number;
    includeBase64?: boolean;
  } = {}
): Promise<ProcessedImageResult> {
  const maxWidth = options.maxWidth ?? 1200;
  const compress = options.compress ?? 0.85;
  const includeBase64 = options.includeBase64 ?? true;

  try {
    let originalWidth = 0;
    let originalHeight = 0;

    try {
      const dimensions = await getImageDimensions(uri);
      originalWidth = dimensions.width;
      originalHeight = dimensions.height;
    } catch {
      // If dimension retrieval fails (e.g. some web blob formats), proceed with resize action
      originalWidth = maxWidth + 1;
    }

    const actions: ImageManipulator.Action[] = [];

    // Only downscale if original width is greater than maxWidth
    if (originalWidth > maxWidth) {
      actions.push({
        resize: {
          width: maxWidth,
        },
      });
    }

    const result = await ImageManipulator.manipulateAsync(uri, actions, {
      compress,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: includeBase64,
    });

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      base64: result.base64,
    };
  } catch (err) {
    console.warn('Image manipulation notice, falling back to original image:', err);
    return {
      uri,
      width: 0,
      height: 0,
    };
  }
}
