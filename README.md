# v0-unlimited-grid

A modern, scalable, and production-ready Next.js (App Router) + TailwindCSS project inspired by Framer.com’s UI/UX style.
This project features dynamic image grids, animal descriptions, reusable components, and a clean codebase for rapid growth and easy expansion.

---

## 🚀 Features

* **Next.js App Router** for modern routing and layouts
* **Dynamic Image Grid** with slug-based pages
* **Animal Data Management** via simple `public/data.json`
* **Reusable React Components** for fast development
* **TailwindCSS** for utility-first, responsive design
* **TypeScript** for strong typing & reliability
* **Easy Asset Management** using `public/` folder
* **Clear Project Structure** (best practice & scalable)
* **Ready for SEO & Accessibility** enhancements

---

## 🗂️ Project Structure

```plaintext
.
├── app/                # Main Next.js routes and pages (App Router)
│   └── image/          # Dynamic image routes ([slug])
│       └── [slug]/     # Dynamic image detail pages
├── components/         # Reusable React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions (e.g. slugify)
├── public/             # Static assets (images, data.json, etc)
│   └── data.json       # List of animals and descriptions
├── styles/             # Tailwind & global CSS
├── package.json        # Project metadata and dependencies
├── tailwind.config.ts  # TailwindCSS configuration
├── tsconfig.json       # TypeScript configuration
└── ...                 # Other config and project files
```

---

## 📦 Installation

1. **Clone this repo**

   ```sh
   git clone https://github.com/vitoatmo/v0-unlimited-grid.git
   cd v0-unlimited-grid
   ```
2. **Install dependencies**

   ```sh
   npm install
   ```

   *Jika ada error dependency, gunakan:*

   ```sh
   npm install --legacy-peer-deps
   ```
3. **Run the development server**

   ```sh
   npm run dev
   ```
4. **Open in your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

---

## 🦄 Usage

* **Home**: Dynamic grid of animal images
* **Detail Page**: Click any image to view animal info (slug-based routing)
* **Add/Edit Animals**: Update `public/data.json` (add new objects for each animal; includes `slug`, `imageUrl`, `description`, `tags`)
* **Assets**: Place images in `public/` or reference external URLs

---

## ✨ Customization & Expansion

* Add new components to `components/`
* Add new hooks to `hooks/`
* Modify page layouts and routes in `app/`
* Expand animal data in `public/data.json`
* Adjust styling in `styles/` and `tailwind.config.ts`

---

## 💡 Development Tips

* **Component-based**: Build UI as small, reusable components
* **Type-safe**: Use TypeScript everywhere for safety and autocompletion
* **SEO**: Update `app/head.tsx` for meta tags, OpenGraph, etc
* **Accessibility**: Always use descriptive `alt` tags for images

---

## 🛠️ Scripts

```sh
npm run dev      # Start local dev server
npm run build    # Build for production
npm run start    # Start production server
```

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork this repo, submit issues, or open pull requests for features and improvements.

---

## 📄 License

MIT

---

## 📣 Credits

Built by [Vito Atmo](https://github.com/vitoatmo).
