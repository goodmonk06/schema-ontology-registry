/**
 * Schema validation adapter interface
 * Implementations can validate JSON Schema, OpenAPI, Avro, etc.
 */
export interface IValidationAdapter {
  validate(schema: any, type: string): Promise<ValidationResult>;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code?: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}

/**
 * Basic JSON Schema validator (stub implementation)
 */
export class JsonSchemaValidationAdapter implements IValidationAdapter {
  async validate(schema: any, type: string): Promise<ValidationResult> {
    // Stub implementation - in production, use Ajv or similar
    if (type === 'json_schema') {
      const hasSchema = schema.$schema;
      const hasType = schema.type;

      if (!hasSchema || !hasType) {
        return {
          isValid: false,
          errors: [
            {
              path: '$',
              message: 'Schema must have $schema and type properties',
            },
          ],
        };
      }

      return { isValid: true };
    }

    return { isValid: true, warnings: [{ path: '$', message: 'Validation not implemented for this type' }] };
  }
}

// Export default adapter
export const validationAdapter: IValidationAdapter = new JsonSchemaValidationAdapter();
