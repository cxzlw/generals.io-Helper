import { build } from "esbuild";

await build({
    entryPoints: [
        "./src/main.ts",
        "./src/algorithm.ts",
        "./src/autoplay.ts",
        "./src/anti-ac.ts",
    ],
    bundle: true,
    outdir: "js",
    format: "esm",
    target: "es2020",
    splitting: true,
    sourcemap: true,
    minify: false,
    plugins: [],
    loader: {
        ".ts": "ts",
        ".tsx": "tsx",
        ".json": "json",
    },
    define: {
        "process.env.NODE_ENV": '"production"', // 或 `"development"`
    },
});
