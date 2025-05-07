import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack: (config, { isServer }) => {
        // This rule is necessary for @ffmpeg/ffmpeg to load its worker correctly.
        // It prevents Webpack from trying to parse `new URL('./worker.js', import.meta.url)`
        // and similar constructs, letting the browser handle them at runtime.
        config.module.rules.push({
            test: /\.js$/,
            // This targets the distributed files within the ffmpeg packages
            include: [/node_modules\/@ffmpeg\/(ffmpeg|core)/],
            // This tells Webpack to leave the `import.meta.url` and dynamic imports as is
            // This requires `output.module: true` in webpack config, which Next.js handles
            // for client-side bundle when using `type: 'module'` worker, but this rule
            // specifically disables problematic parsing on these modules themselves.
            // parser: { importMeta: false },
        });

        // Handle WASM files as assets
        config.module.rules.push({
            test: /\.wasm$/,
            type: "asset/resource",
        });

        return config;
    },
};

export default nextConfig;
