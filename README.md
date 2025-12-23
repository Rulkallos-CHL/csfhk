# CSFHK - 香港網安論壇

Hong Kong Cybersecurity Forum - A discussion platform for CTF topics and cybersecurity discussions.

## Features

- 🎯 **CTF Discussion Categories**: Web Security, Cryptography, Forensics, Reverse Engineering, Pwn, and more
- 💬 **Discussion Forum**: Interactive forum for cybersecurity discussions with replies
- 🔍 **Search & Filter**: Search discussions and filter by category
- 💾 **Local Storage**: All discussions are saved in browser localStorage
- 📚 **Resources Section**: Learning resources, tools, and relevant links
- 🎨 **Cybersecurity Theme**: Dark theme with terminal aesthetics and green/cyan accents

## Getting Started

Simply open `index.html` in a web browser to view the website.

No build process or dependencies required - it's a pure HTML/CSS/JavaScript static website, perfect for GitHub Pages hosting.

## GitHub Pages Deployment

This website is designed for static hosting on GitHub Pages:

1. Push the repository to GitHub
2. Go to Settings > Pages
3. Select the branch (usually `main` or `master`)
4. The site will be available at `https://yourusername.github.io/repository-name/`

Note: The `.nojekyll` file is included to ensure GitHub Pages serves all files correctly.

## File Structure

```
.
├── index.html      # Main HTML file
├── styles.css      # Cybersecurity-themed styling
├── script.js       # Interactive functionality
├── .nojekyll       # GitHub Pages configuration
└── README.md       # This file
```

## Features Overview

### CTF Discussion Categories
- Six categories for organizing CTF-related discussions
- Dynamic discussion counts per category
- Click categories to filter forum discussions

### Discussion Forum
- Create new discussion threads
- View full thread details with replies
- Reply to existing discussions
- Search discussions by title, content, or author
- Filter by category (CTF, Security, General, News)
- Delete threads
- All data persists in browser localStorage

### Resources
- Learning resources
- Tool recommendations
- Relevant security links

## Customization

You can easily customize:
- Colors in `styles.css` (CSS variables in `:root`)
- Discussion data in `script.js`
- Content in `index.html`

## Browser Support

Modern browsers with CSS Grid and Flexbox support.

## License

© 2024 CSFHK - Stay Secure, Stay Informed


