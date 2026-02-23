/**
 * Convierte un archivo de imagen a Base64
 * @param file - Archivo de imagen
 * @returns Promise con la imagen en formato Base64
 */
export const convertirImagenABase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validar tamaño (máximo 500KB para logos)
    if (file.size > 500 * 1024) {
      reject(new Error('La imagen es muy grande. Usa una imagen menor a 500KB'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Convierte y optimiza un logo de equipo a Base64
 * @param file - Archivo de imagen
 * @returns Base64 string de la imagen
 */
export const subirLogoEquipo = async (file: File): Promise<string> => {
  try {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }
    
    const base64 = await convertirImagenABase64(file);
    return base64;
  } catch (error) {
    console.error('Error al procesar imagen:', error);
    throw error;
  }
};
