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
      description: 'A deep dive into modern web development. Core notes on TypeScript and Node.js, extended with guides on internals, networking, and system architecture.',
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
            property: 'og:site_name',
            content: 'Fullstack Notes',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:title',
            content: 'Fullstack Notes: The JavaScript Ecosystem and Beyond',
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
              collapsed: true,
              autogenerate: { directory: 'javascript/notes' },
            },
            {
              label: 'Gotchas',
              collapsed: true,
              autogenerate: { directory: 'javascript/gotchas' },
            },
            {
              label: 'Coding Interviews',
              collapsed: true,
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
              collapsed: true,
              autogenerate: { directory: 'typescript/notes' },
            },
            {
              label: 'Coding Interviews',
              collapsed: true,
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
              collapsed: true,
              autogenerate: { directory: 'nodejs/notes' },
            },
            {
              label: 'Coding Interviews',
              collapsed: true,
              autogenerate: { directory: 'nodejs/coding-interviews' },
            },
          ],
        },
        {
          label: 'Beyond JavaScript',
          collapsed: true,
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