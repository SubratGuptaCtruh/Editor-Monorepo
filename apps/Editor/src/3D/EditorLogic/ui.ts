import { Vector3 } from "@babylonjs/core";
import { AddGlbModelCommand, AddLightCommand, RemoveObjCommand } from "./commands";
import { editor } from "./editor";

// import { AddSpatialAudio } from "./commands";

editor.canvas.addEventListener("dragover", (event) => {
    event.preventDefault();
    console.log("hover");
});

editor.canvas.addEventListener("drop", (event) => {
    event.preventDefault();
    event.preventDefault();
    if (!event.dataTransfer) {
        console.warn("got on data from the droped files");
        return;
    }
    const files = event.dataTransfer.files[0];

    console.log(files, "this");
    if (!files) {
        console.warn("no files found ");
        return;
    }
    const blobUrl = URL.createObjectURL(files);
    editor.executer(new AddGlbModelCommand(editor, files.name, { root: "", fileName: blobUrl }));
    // this.addObject(scene,files.name,)
});
document.addEventListener("keydown", (event) => {
    event.preventDefault();
    if (event.key === "e" || event.key === "E") {
        console.log("pressed E ");
        if (editor.selector.selected) {
            editor.executer(new RemoveObjCommand(editor, editor.selector.selected, false));
            console.log(editor.selector.selected);
        }
    }
});
document.addEventListener("keydown", function (event) {
    // Check which key is pressed
    switch (event.key) {
        case "M":
            editor.executer(
                new AddLightCommand(editor, {
                    type: "PointLight",
                    direction: null,
                    position: new Vector3(0, 0, 0),
                    hexColor: "#ffffff",
                    intensity: 1,
                })
            );
            break;
        case "D":
            editor.executer(
                new AddLightCommand(editor, {
                    type: "DirectionalLight",
                    position: new Vector3(Math.cos((100 * Math.PI) / 180) * 10, 20, Math.sin((50 * Math.PI) / 18) * 100),
                    direction: new Vector3(0, -1, 0),
                    hexColor: "#ffffff",
                    intensity: 1,
                })
            );

            break;
        case "S":
            editor.executer(
                new AddLightCommand(editor, {
                    type: "SpotLight",
                    position: new Vector3(0, -1, 0),
                    direction: new Vector3(Math.cos((100 * Math.PI) / 180) * 100, 20, Math.sin((50 * Math.PI) / 180) * 100),
                    hexColor: "#ffffff",
                    intensity: 1,
                })
            );
            // spotLight.setEnabled(!spotLight.isEnabled());
            // editor.addLight('SpotLight', "#ffffff", 1, new Vector3(100, 100, 0), new Vector3(0, -1, 0));
            break;
        case "o":
            editor.save();
            // spotLight.setEnabled(!spotLight.isEnabled());
            // editor.addLight('SpotLight', "#ffffff", 1, new Vector3(100, 100, 0), new Vector3(0, -1, 0));
            break;
        case "B":
            console.log("pressed B");
            if (!editor.selector.selected) return;
            // // async function getArrayBufferFromUrl(url: string): Promise<ArrayBuffer> {
            // //     const response = await fetch(url);

            // //     if (!response.ok) {
            // //         throw new Error(`Failed to fetch URL: ${url}`);
            // //     }

            // //     const arrayBuffer = await response.arrayBuffer();
            // //     return arrayBuffer;
            // // }
            // editor.executer(new AddSpatialAudio(editor, new Vector3(0, 0, 0), "audio.mp3"));

            // spotLight.setEnabled(!spotLight.isEnabled());
            // editor.addLight('SpotLight', "#ffffff", 1, new Vector3(100, 100, 0), new Vector3(0, -1, 0));
            break;
    }
});
document.addEventListener("keydown", (event) => {
    event.preventDefault();
    if (event.key === "u" || event.key === "U") {
        // console.log(this.scene)
        // this.addObject(scene)
        editor.undo();
        console.log("pressed U ");
        // this.afterLoad((s)=>{
        //     logSecen(s,12)
        //     console.log('afterLoad,pe',s,12)
        // })
    }
    if (event.key === "R" || event.key === "r") {
        editor.redo();
        console.log("pressed R");
    }
    if (event.key === "s" || event.key === "S") {
        editor.selector.toggleMode("position");
        console.log("pressed s");
    }
    if (event.key === "D" || event.key === "d") {
        editor.selector.toggleMode("rotation");
        console.log("pressed d");
    }
    if (event.key === "f" || event.key === "F") {
        editor.selector.toggleMode("scale");
        console.log("pressed f");
    }
});
