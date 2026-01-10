import {ConfigData} from "../utils/config.js";

export const presets: ConfigData = {
    "react-router-shadcn": {
        "commands": [
            "mkdir {{name}}",
            "git clone https://github.com/HichemTab-tech/vite-react-router-shadcn-template {{name}}",
            "cd {{name}}",
            "pnpm install",
            "pnpm run dev"
        ]
    },
    "react-shadcn": {
        "commands": [
            "mkdir {{name}}",
            "git clone https://github.com/HichemTab-tech/vite-shadcn-template {{name}}",
            "cd {{name}}",
            "pnpm install",
            "pnpm run dev"
        ]
    }
};
