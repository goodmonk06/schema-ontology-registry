# Contributing Guide

Thank you for considering contributing to the Schema & Ontology Registry!

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/schema-ontology-registry.git
   cd schema-ontology-registry
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up your environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your local database URL
   ```

5. **Run database migrations**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
- Follow the existing code style
- Write tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes
```bash
# Run tests
npm test

# Run type checking
npm run typecheck

# Run linter
npm run lint

# Check formatting
npm run format:check
```

### 4. Commit Your Changes
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add schema validation feature"
git commit -m "fix: resolve pagination bug in list endpoint"
git commit -m "docs: update API documentation"
git commit -m "test: add tests for schema service"
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions/changes
- `refactor`: Code refactoring
- `style`: Code style changes
- `chore`: Build/tooling changes

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear description of changes
- Link to related issues
- Screenshots for UI changes
- Test coverage information

## Code Standards

### TypeScript
- Use strict mode
- Prefer interfaces over types for object shapes
- Use enums for fixed sets of values
- Avoid `any` - use `unknown` if type is truly unknown

### Code Style
- Use Prettier for formatting (auto-format on save)
- Follow ESLint rules
- Use meaningful variable names
- Keep functions small and focused
- Add comments for complex logic

### File Organization
```
app/
  api/              # API route handlers
  namespace/        # UI pages
lib/
  services/         # Business logic
  validation/       # Zod schemas
  errors/           # Error handling
  events/           # Event bus
  adapters/         # Integration interfaces
tests/
  unit/             # Unit tests
  integration/      # Integration tests
  fixtures/         # Test data
```

### Testing Guidelines

#### Unit Tests
- Test business logic in services
- Mock database calls
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('SchemaService', () => {
  describe('createSchema', () => {
    it('should create a new schema successfully', async () => {
      // Arrange
      const input = { ... };

      // Act
      const result = await service.createSchema(input);

      // Assert
      expect(result.version).toBe('1.0.0');
    });
  });
});
```

#### Integration Tests
- Test full API flows
- Use real test database
- Clean up after each test
- Test error cases

### API Development

#### Input Validation
Always validate inputs with Zod:
```typescript
const validatedData = createSchemaSchema.parse(body);
```

#### Error Handling
Use the error handler wrapper:
```typescript
export const POST = withErrorHandler(async (request) => {
  // Your logic here
});
```

#### Logging
Add contextual logging:
```typescript
logger.info({ schemaId }, 'Processing schema');
logger.error({ error, context }, 'Operation failed');
```

#### Events
Emit domain events for side effects:
```typescript
eventBus.emit('schema.created', {
  schemaId: schema.id,
  version: schema.version,
});
```

### Database Changes

#### Creating Migrations
```bash
# Make changes to prisma/schema.prisma
npx prisma migrate dev --name descriptive_migration_name
npx prisma generate
```

#### Migration Guidelines
- One logical change per migration
- Include rollback considerations
- Test migrations on copy of production data
- Document breaking changes

### Documentation

Update relevant documentation:
- **README.md**: For user-facing features
- **ARCHITECTURE.md**: For architectural changes
- **API docs**: For endpoint changes
- **Code comments**: For complex logic

## Pull Request Review Process

### What We Look For
1. ✅ Tests pass
2. ✅ Code follows style guidelines
3. ✅ Documentation is updated
4. ✅ No breaking changes (or clearly documented)
5. ✅ Performance impact considered
6. ✅ Security implications reviewed

### Review Timeline
- Initial review within 2-3 days
- Feedback should be addressed promptly
- Final approval requires 1-2 maintainer reviews

## Need Help?

- Check existing issues for similar problems
- Read the architecture documentation
- Ask questions in issue comments
- Join our discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
