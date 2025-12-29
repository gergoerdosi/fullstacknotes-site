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