<div align="center">
  <img src=".github/branding/logo.png" alt="Localine Logo" width="200"/>

  # Localine
  
  [![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
  [![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
  
  **An open translation management platform for teams**
  
  [Features](#features) • [Tech Stack](#tech-stack) • [Configuration](#configuration) • [User Management CLI](#user-management-cli) • [License](#license)
</div>

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [User Management CLI](#user-management-cli)
- [Development](#development)
- [License](#license)
- [Support](#support)

---

## ✨ Features

- 🔐 **User Authentication** - Secure signup/login with server-side session management
- 📁 **Project Management** - Create and manage multiple translation projects
- 👥 **Team Collaboration** - Invite team members with role-based access control
- 🌍 **Multi-language Support** - Add multiple locales to your projects
- 📝 **Terms & Translations** - Manage translation keys and their translations
- 🔑 **API Keys** - Generate API keys with role-based permissions
- 🎨 **Modern UI** - Beautiful interface built with Radix UI and Tailwind CSS
- 📊 **RESTful API** - Complete API for integration with your applications
- 🔍 **Search & Filter** - Powerful search and filtering capabilities
- 📥 **Import/Export** - Support for multiple translation file formats

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | MariaDB / MySQL |
| **ORM** | Prisma |
| **UI Components** | Radix UI |
| **Styling** | Tailwind CSS |
| **State Management** | TanStack Query (React Query) |
| **Authentication** | Opaque server-side sessions (DB + optional Redis cache) |
| **API Documentation** | Swagger/OpenAPI |

---

## ⚙️ Configuration

### Environment Variables

See `.env.example` for required environment variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_HOST` | Database host | `localhost` | ✅ |
| `DATABASE_PORT` | Database port | `3306` | ✅ |
| `DATABASE_USER` | Database user | - | ✅ |
| `DATABASE_PASSWORD` | Database password | - | ✅ |
| `DATABASE_NAME` | Database name | `localine` | ✅ |
| `NODE_ENV` | Environment mode | `development` | ✅ |
| `SIGNUPS_ENABLED` | Allow new account creation through web interface and API | `true` | ❌ |
| `SESSION_EXPIRES_DAYS` | Days until a session token becomes invalid for normal requests | `14` | ❌ |
| `SESSION_REFRESH_EXPIRES_DAYS` | Days until a session token can no longer be refreshed | `30` | ❌ |
| `REDIS_URL` | Redis connection string for session caching (e.g. `redis://localhost:6379`). Requires `npm install ioredis`. Falls back to in-process cache when unset. | - | ❌ |
| `GEOIP_ENABLED` | Set to `true` to geo-locate client IPs on session creation (city + country via ip-api.com) | `false` | ❌ |

### Database Setup

Ensure your database is running and accessible with the credentials specified in your `.env` file.

---

## 📱 User Management CLI

### Create User

Create a new user account:

```bash
npx tsx scripts/user-cli.ts create-user --email user@example.com --password secretpass123 --name "John Doe"
```

**Options:**
- `-e, --email <email>` - User email address (required)
- `-p, --password <password>` - User password (required, minimum 8 characters)
- `-n, --name <name>` - User full name (required)

**Example:**
```bash
npx tsx scripts/user-cli.ts create-user --email admin@company.com --password admin123456 --name "Admin User"
```

### Delete User

Delete a user account by email or ID:

```bash
# Delete by email
npx tsx scripts/user-cli.ts delete-user --email user@example.com

# Delete by ID
npx tsx scripts/user-cli.ts delete-user --id 550e8400-e29b-41d4-a716-446655440000

# Force delete without confirmation
npx tsx scripts/user-cli.ts delete-user --email user@example.com --force
```

**Options:**
- `-e, --email <email>` - User email address
- `-i, --id <id>` - User ID (UUID)
- `-f, --force` - Skip confirmation prompt

**Notes:**
- Either `--email` or `--id` must be provided (not both)
- Deleting a user will also delete all their owned projects and remove them from project memberships
- Use `--force` flag for automated scripts to skip confirmation

---

## 🚀 Development

### Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── (auth)/      # Authentication pages
│   ├── (dashboard)/ # Dashboard pages
│   └── api/         # API routes
├── components/       # React components
│   ├── ui/          # UI components (Radix)
│   └── layout/      # Layout components
├── hooks/           # Custom React hooks
└── lib/             # Utility libraries
    ├── auth.ts      # Authentication utilities
    ├── db.ts        # Database utilities
    └── prisma.ts    # Prisma client
```

### Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

### API Documentation

Once the server is running, you can access the API documentation at:

```
http://localhost:3000/api
```

---

## 📝 License

This project is licensed under the GNU Affero General Public License v3.0. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

If you encounter any problems or have questions, please open an [issue](https://github.com/LocalineServices/web-app/issues) on GitHub.

---

<div align="center">
  Made with ❤️ by ItzMxritz & LeonJS_
  
  [GitHub](https://github.com/LocalineServices)
</div>
