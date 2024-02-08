import type { Engine } from "@babylonjs/core";
export const onResize = (engine: Engine) => {
    engine.resize(true);
};
