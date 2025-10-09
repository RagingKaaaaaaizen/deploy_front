# PC Inventory Management System

Angular 10+ application for managing PC hardware inventory with authentication, verification, and comprehensive management features.

---

## 🎉 Recent Updates

### ✅ Tailwind CSS Migration Complete
- **Migrated from Bootstrap to Tailwind CSS** - 75% reduction in CSS bundle size
- **Flowbite Component Library** - 56+ pre-built UI components installed
- **Ready for Tailwind Templates** - Copy/paste any Tailwind UI component
- See: `TAILWIND_MIGRATION_COMPLETE.md` for full details

### 🎨 UI Enhancements
- Modern, responsive PC management pages
- Sticky headers and smart scrolling
- Enhanced filters with chips
- Detailed success/error notifications
- User preference toggles in profile

---

## 🚀 Quick Start

### Development Server
```bash
npm start
# or
npm run dev
```
Navigate to `http://localhost:4200/`

### Production Build
```bash
npm run build:prod
```

---

## 📚 Documentation

- **[Tailwind Migration Plan](TAILWIND_MIGRATION_PLAN.md)** - Complete migration strategy and results
- **[Tailwind Migration Complete](TAILWIND_MIGRATION_COMPLETE.md)** - What was accomplished and next steps
- **[Flowbite Setup](FLOWBITE_SETUP.md)** - Component library guide with examples
- **[Tailwind Setup](TAILWIND_SETUP.md)** - Initial Tailwind configuration
- **[Frontend Deployment](FRONTEND_PRODUCTION_DEPLOYMENT.md)** - Production deployment guide

---

## 🎨 UI Component Libraries

### Flowbite (Installed)
- 56+ pre-built components
- Authentication pages (login, register)
- Forms, tables, modals, cards, buttons
- **Docs**: https://flowbite.com/docs/getting-started/introduction/

### Available Resources
- **Tailwind UI**: https://tailwindui.com/ (premium)
- **Flowbite Blocks**: https://flowbite.com/blocks/ (free sections)
- **Headless UI**: https://headlessui.com/ (unstyled primitives)
- **daisyUI**: https://daisyui.com/ (component classes)

---

## 🛠️ Tech Stack

### Frontend
- **Angular 10+** - Framework
- **Tailwind CSS 3.x** - Styling
- **Flowbite** - Component library
- **RxJS** - Reactive programming
- **TypeScript** - Type safety

### Features
- Email signup with verification
- Authentication & authorization
- Password reset flow
- PC inventory management
- Build template system
- Component comparison
- Stock management
- Activity logging
- Analytics dashboard

---

## 📁 Project Structure

```
src/
├── app/
│   ├── _components/      # Shared UI components
│   ├── _helpers/         # Utilities & class maps
│   ├── _services/        # API services
│   ├── _middleware/      # Guards & interceptors
│   ├── account/          # Authentication pages
│   ├── home/             # Dashboard
│   ├── pc/               # PC management (✅ Tailwind)
│   ├── profile/          # User profile (✅ Tailwind)
│   └── ...               # Other features
├── styles/
│   ├── styles.less       # Global styles
│   └── tw-bridge.css     # Bootstrap→Tailwind bridge
└── environments/         # Environment configs
```

---

## 🎯 Key Features

### PC Management
- **List View** - Filterable table with search, status, location filters
- **Components** - Hardware inventory with comparison tools
- **Templates** - Pre-configured build templates
- **Sticky UI** - Optional sticky headers and controls (user preference)

### Authentication
- Email signup with verification
- Secure login with JWT tokens
- Password reset flow
- Role-based access control

### Inventory
- Stock tracking with receipts
- Disposal management
- Storage locations
- Category organization

### Analytics
- Usage statistics
- Activity logs
- Performance metrics

---

## 🎨 Using Tailwind Templates

Your project is now ready to use any Tailwind component:

```html
<!-- Example: Flowbite button with your brand colors -->
<button class="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg">
  Your Button
</button>
```

### Brand Colors Available
- `bg-primary` - #0d6efd (blue)
- `bg-success` - #198754 (green)
- `bg-warning` - #ffc107 (yellow)
- `bg-danger` - #dc3545 (red)
- `bg-info` - #0dcaf0 (cyan)

---

## 🔧 Development

### Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Lint & Format
```bash
npm run lint
```

### Build for Production
```bash
npm run build:prod
```

### Test Production Build
```bash
npm run test:render
```

---

## 📦 Bundle Size

After Tailwind migration:
- **CSS**: 52.20 kB raw (7.52 kB gzipped)
- **JS (main)**: 1.09 MB raw (287.89 kB gzipped)
- **Total initial**: 1.17 MB raw (308.17 kB gzipped)

---

## 🚀 Deployment

See `FRONTEND_PRODUCTION_DEPLOYMENT.md` for complete deployment instructions.

### Quick Deploy to Render
```bash
# Build is handled by render.yaml
git push origin main
```

---

## 👥 Team

Original boilerplate: jarumay

Enhanced with:
- Tailwind CSS migration
- Flowbite component library
- Modern UI/UX improvements
- Advanced PC management features

---

## 📄 License

See `LICENSE` file for details.

---

## 🆘 Support

- **Flowbite Docs**: https://flowbite.com/docs/
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Angular Docs**: https://angular.io/docs

---

**Project Status**: ✅ Production Ready  
**Bootstrap**: ❌ Removed  
**Tailwind**: ✅ Fully Integrated  
**Flowbite**: ✅ Installed & Configured  
**Templates**: ✅ Ready to Use
