/**
 * Enum of supported MIME types for file uploads.
 * Each entry maps a file type to its standard MIME type string.
 */
export enum MimeTypes {
    /** Adobe PDF document */
    PDF = "application/pdf",
    
    /** Microsoft Word document (DOCX) */
    DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    
    /** Microsoft Word document (DOC) */
    DOC = "application/msword",
    
    /** Microsoft Excel spreadsheet (XLSX) */
    XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    
    /** Microsoft Excel spreadsheet (XLS) */
    XLS = "application/vnd.ms-excel",
    
    /** Comma-separated values file */
    CSV = "text/csv",
    
    /** Microsoft PowerPoint presentation (PPTX) */
    PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    
    /** Microsoft PowerPoint presentation (PPT) */
    PPT = "application/vnd.ms-powerpoint",
    
    /** JPEG image format */
    JPG = "image/jpeg",
    
    /** JPEG image format (alternate extension) */
    JPEG = "image/jpeg",
    
    /** PNG image format */
    PNG = "image/png"
  }
  
  /**
   * Maps file extensions to their corresponding MIME types.
   * Used for determining the MIME type of a file based on its extension.
   */
  export const fileExtensionMap: Record<string, MimeTypes> = {
    pdf: MimeTypes.PDF,
    docx: MimeTypes.DOCX,
    doc: MimeTypes.DOC,
    xlsx: MimeTypes.XLSX,
    xls: MimeTypes.XLS,
    csv: MimeTypes.CSV,
    pptx: MimeTypes.PPTX,
    ppt: MimeTypes.PPT,
    jpg: MimeTypes.JPG,
    jpeg: MimeTypes.JPEG,
    png: MimeTypes.PNG
  };
  
  /**
   * Array of all supported MIME types.
   * Used for validation and filtering of file uploads.
   */
  export const acceptedMimeTypes = Object.values(MimeTypes); 