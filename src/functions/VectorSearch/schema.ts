export interface Reference {
  fileId: string;
  fileName: string;
  pageNumbers: number[];
  url: string;
}

export const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "fileId": {
        "type": "string",
        "description": "The unique identifier of the file."
      },
      "fileName": {
        "type": "string",
        "description": "The name of the file."
      },
      "pageNumbers": {
        "type": "array",
        "items": {
          "type": "integer",
          "description": "Page numbers referenced in the document."
        },
        "description": "An array of page numbers."
      },
      "url": {
        "type": "string",
        "format": "uri",
        "description": "The URL where the document can be accessed."
      }
    },
    "required": ["fileName", "pageNumbers", "url"],
    "additionalProperties": false
  }
}