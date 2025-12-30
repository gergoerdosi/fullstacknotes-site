// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://fullstacknotes.dev',
  integrations: [
    starlight({
      title: 'Fullstack Notes',
      description: 'A collection of practical notes and tips for modern web development.',
      favicon: '/favicon-dark-32.png',
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/favicon-light-32.png',
            media: '(prefers-color-scheme: light)',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/favicon-dark-32.png',
            media: '(prefers-color-scheme: dark)',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://fullstacknotes.dev/og-default.png',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'twitter:card',
            content: 'summary_large_image',
          },
        },
      ],
      customCss: [
        './src/styles/custom.css',
      ],
      sidebar: [
        {
          label: 'JavaScript',
          collapsed: false,
          items: [
            {
              label: 'Notes',
              collapsed: false,
              autogenerate: { directory: 'javascript/notes' },
            },
            {
              label: 'Gotchas',
              collapsed: false,
              autogenerate: { directory: 'javascript/gotchas' },
            },
            {
              label: 'Coding Interviews',
              collapsed: false,
              autogenerate: { directory: 'javascript/coding-interviews' },
            },
          ],
        },
        {
          label: 'TypeScript',
          collapsed: false,
          items: [
            {
              label: 'Notes',
              collapsed: false,
              autogenerate: { directory: 'typescript/notes' },
            },
            {
              label: 'Coding Interviews',
              collapsed: false,
              autogenerate: { directory: 'typescript/coding-interviews' },
            },
          ],
        },
        {
          label: 'Node.js',
          collapsed: false,
          items: [
            {
              label: 'Notes',
              collapsed: false,
              autogenerate: { directory: 'nodejs/notes' },
            },
            {
              label: 'Coding Interviews',
              collapsed: false,
              autogenerate: { directory: 'nodejs/coding-interviews' },
            },
          ],
        },
        {
          label: 'Beyond JavaScript',
          collapsed: false,
          autogenerate: { directory: 'beyond-javascript' },
        },
      ],
      components: {
        SiteTitle: './src/components/SiteLogo.astro',
        PageTitle: './src/components/PageTitleWithBreadcrumbs.astro',
        Footer: './src/components/CustomFooter.astro',
      },
    }),
    sitemap()
  ],
});