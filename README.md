# Node.js Monorepo Template

A modern Node.js monorepo template with ESM support, configured with ESLint, Prettier, Husky, and Conventional Commits.

## 📦 Project Structure

```
monorepo/
├── apps/                  # Application packages
│   └── apis/              # Express API application
├── packages/              # Shared packages
│   └── db-services/       # Database services package
├── .husky/                # Git hooks
├── .vscode/               # VS Code settings
├── eslint.config.js       # ESLint configuration
├── .prettierrc            # Prettier configuration
└── commitlint.config.js   # Commitlint configuration
```

## 🛠 Tech Stack

- **Node.js**: v22.11.0
- **Package Manager**: Yarn v1.22.x
- **Module System**: ESM (ECMAScript Modules)
- **Code Quality**:
  - ESLint with Airbnb base config
  - Prettier
  - Import sorting
  - Security plugin
- **Git Hooks**:
  - Husky
  - lint-staged
  - Conventional commits

## 🚀 Getting Started

1. **Clone the repository**

```bash
git clone <repository-url>
cd monorepo
```

2. **Install dependencies**

```bash
yarn install
```

3. **Start the API server**

```bash
cd apps/apis
yarn start
```

## 📝 Example Projects

### Express API Server (`apps/apis`)

A simple REST API server with MongoDB integration:

- Endpoints:
  - `GET /`: Fetch all users
  - `POST /`: Create a new user

### Database Services (`packages/db-services`)

Shared MongoDB services using Mongoose:

- User model and schema
- CRUD operations
- Database connection utility

## 🔧 Development Guide

### Adding a New Package

1. Create a new directory in `apps/` or `packages/`
2. Initialize with `package.json`:

```json
{
  "name": "your-package",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "private": true
}
```

### Git Commits

This project uses conventional commits. Commit messages must follow the pattern:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Code Style

- ESLint and Prettier are configured to work together
- Import sorting is enforced
- Run `yarn lint` to check for issues
- Run `yarn lint:fix` to automatically fix issues
- Run `yarn format` to format code with Prettier

### VS Code Integration

The project includes VS Code settings for:

- Disabling built-in JavaScript validation
- Recommended extensions (TODO: Add `.vscode/extensions.json`)

## 🤝 Contributing

1. Create a new branch
2. Make your changes
3. Run tests and linting
4. Create a pull request

## 📄 License

MIT
