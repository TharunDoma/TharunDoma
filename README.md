# Portfolio - Next.js 14 App

A modern, responsive portfolio website built with Next.js 14, TypeScript, and Tailwind CSS. Features a dark theme with emerald accents, showcasing AI tools and projects.

## 🚀 Features

- **Next.js 14 App Router**: Modern React framework with server components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Dark Theme**: Slate-900 background with Emerald-500 accents
- **Responsive Design**: Works on all devices
- **Lucide Icons**: Beautiful, consistent iconography

## 📁 Project Structure

```
├── app/
│   ├── page.tsx              # Portfolio landing page (Hero, Skills, Featured Work)
│   ├── layout.tsx            # Root layout with Navbar and Footer
│   ├── globals.css           # Global styles and Tailwind directives
│   ├── projects/
│   │   ├── page.tsx          # AI tools grid (8 tools)
│   │   └── ai-chat/
│   │       └── page.tsx      # Interactive chat interface
│   └── dashboard/
│       └── page.tsx          # Dashboard with earnings and goals
├── components/
│   ├── Navbar.tsx            # Navigation component
│   └── Footer.tsx            # Footer with social links
└── public/                   # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Package Manager**: npm

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TharunDoma/TharunDoma.git
cd TharunDoma
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📄 Pages

### Home (`/`)
- Hero section with name and title
- Skills & Expertise grid (6 skills)
- Featured Work cards (3 projects)

### Projects (`/projects`)
- Grid of 8 AI tools with different colors
- Each tool has icon, title, description, and status
- Clickable cards leading to tool pages

### AI Chat (`/projects/ai-chat`)
- Interactive chat interface
- Message history
- Mock AI responses
- Clear chat functionality

### Dashboard (`/dashboard`)
- Statistics cards (Earnings, Projects, Goals, Achievements)
- Recent earnings list
- Goals progress bars
- Monthly summary

## 🎨 Design System

### Colors
- **Background**: Slate-900 (`#0f172a`)
- **Primary**: Emerald-500 (`#10b981`)
- **Text**: Slate-200/300/400
- **Borders**: Slate-700

### Components
- Navbar with navigation links
- Footer with social media links
- Consistent card styling
- Hover effects and transitions

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔒 Security

This project has been scanned with CodeQL and contains no known security vulnerabilities.

## 📦 Dependencies

- next: ^14.2.35
- react: ^18 & react-dom: ^18
- typescript: Latest
- tailwindcss: ^3.4.0
- lucide-react: Latest
- autoprefixer & postcss: Latest

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Tharun Doma**
- GitHub: [@TharunDoma](https://github.com/TharunDoma)

---

Built with ❤️ using Next.js 14
