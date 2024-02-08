import { AbstractMesh, Color3, Engine, MeshBuilder, PBRMaterial, Sound, StandardMaterial, Tags, Texture, Vector3, VideoTexture } from "@babylonjs/core";
import toast from "react-hot-toast";
import { Editor, MeshMetadata } from "./editor";

const landscapeRatios = ["16:9", "4:3", "2:1", "1:1"];
const portraitRatios = ["9:16", "3:4", "1:2", "1:1"];

export const getSizeFromAspect = (aspectRatioString: string) => {
    let screenAspectRatio: number = 16 / 9;

    const [width, height] = aspectRatioString.split(":").map(Number);
    const aspectRatio = width / height;

    if (landscapeRatios.includes(aspectRatioString) || portraitRatios.includes(aspectRatioString)) {
        screenAspectRatio = aspectRatio;
    }

    const screenWidth = 10 * screenAspectRatio;
    const screenHeight = screenWidth / screenAspectRatio;

    return [screenWidth, screenHeight];
};

export class ScreenLoader {
    public editor: Editor;
    constructor(editor: Editor) {
        this.editor = editor;
    }
    addVideoImageScreens = (aspectRatioString: string, name: string, id: string, link: string | null, fileName: string | null, position: Vector3) => {
        this.editor.afterLoad((scene) => {
            const metadata: MeshMetadata<"Screen"> = {
                isroot: false,
                data: {
                    screenName: id,
                    videoSources: null, // id is set as name to retrieve the audio from scene using this as name
                    imageSources: null,
                    isBillboard: null,
                    aspectRatio: aspectRatioString,
                    isPlaying: null,
                    isLooping: false,
                    volume: 0,
                    fileName,
                },
                tags: ["FocusTarget"],
                allowedSelectionModes: ["position", "rotation", null],
                type: "Screen",
                meshType: null,
            };

            const [screenWidth, screenHeight] = getSizeFromAspect(aspectRatioString);

            //creating default plane for the screen
            const screen = MeshBuilder.CreatePlane(name, { size: 1 }, scene);
            screen.id = id;
            screen.scaling.set(screenWidth, screenHeight, 1);

            screen.position.set(position.x, position.y, position.z);
            screen.position.y = screenHeight / 2;
            //to position the screen above the grid
            // Create a material for the plane
            const material = new StandardMaterial("material", scene);
            material.diffuseColor = new Color3(0, 0, 1); // Blue color
            // Disable backface culling for the material
            material.backFaceCulling = false;
            screen.material = material;

            screen.metadata = metadata;

            material.maxSimultaneousLights = 10;

            Tags.AddTagsTo(screen, "Screen");

            screen.id = id;

            if (!link) {
                this.editor.UIeventEmitter.emit("sceneGraphChange", () => {});
                this.editor.selector.select(screen);
                return;
            }
            this.setTexture(screen, link, fileName || "");
            this.editor.UIeventEmitter.emit("sceneGraphChange", () => {});
            this.editor.selector.select(screen);
        });
    };

    private _addVideoTexture = (object: AbstractMesh, url: string, fileName: string) => {
        this.editor.afterLoad((scene) => {
            try {
                if (object.material) object.material.dispose();
                const videoMat = new StandardMaterial("Video", scene);
                videoMat.backFaceCulling = false;
                const videoTex = new VideoTexture("video", url, scene);
                //audio for the video
                const data = object.metadata.data;
                const videoSound = new Sound(object.id, url, scene, null, {
                    loop: data.isLooping,
                    autoplay: false,
                    spatialSound: true,
                    maxDistance: 30,
                });

                videoSound.setVolume(object.metadata.data.volume);

                object.metadata.data.videoSources = url;
                object.metadata.data.imageSources = null;
                object.metadata.data.fileName = fileName;

                if (videoTex instanceof VideoTexture) {
                    videoTex.video.currentTime = 0;
                    videoTex.video.pause();
                    videoTex.video.loop = false;
                }

                object.metadata.data.isPlaying = false;
                videoTex.video.onended = () => {
                    object.metadata.data.isPlaying = false;
                    this.editor.UIeventEmitter.emit("screenStateChanged", object.id, object.metadata.data);
                };
                videoTex.video.muted = true;

                videoMat.diffuseTexture = videoTex;
                videoMat.roughness = 1;
                videoMat.emissiveColor = new Color3(1, 1, 1);
                object.material = videoMat;

                videoSound.attachToMesh(object);

                scene.mainSoundTrack.soundCollection.push(videoSound);
                this.editor.UIeventEmitter.emit("screenStateChanged", object.id, object.metadata.data);
            } catch (error) {
                console.error("Error adding video texture");
            }
        });
    };
    private _addImageTexture = (mesh: AbstractMesh, imageUrl: string, fileName: string) => {
        this.editor.afterLoad((scene) => {
            try {
                if (mesh.material) mesh.material.dispose();
                const material = new PBRMaterial("imageMaterial", scene);
                const imageTexture = new Texture(imageUrl, scene, true, true, Texture.TRILINEAR_SAMPLINGMODE, null, null);
                imageTexture.uScale = 1;
                imageTexture.vScale = 1;
                material.albedoTexture = imageTexture;
                material.albedoTexture.hasAlpha = true;
                material.emissiveTexture = imageTexture;
                material.emissiveColor = new Color3(1, 1, 1);
                material.albedoTexture.coordinatesMode = Texture.PLANAR_MODE;

                mesh.metadata.data.videoSources = null;
                mesh.metadata.data.imageSources = imageUrl;
                mesh.metadata.data.fileName = fileName;
                mesh.material = material;
                // adjustTextureAspectRatio(mesh)
                material.backFaceCulling = false;
                this.editor.UIeventEmitter.emit("screenStateChanged", mesh.id, mesh.metadata.data);
            } catch (error) {
                console.error("Error adding image texture");
            }
        });
    };

    public setTexture = (screen: AbstractMesh, link: string, fileName: string) => {
        this.editor.afterLoad(() => {
            const videoFiles = [".mp4", ".mov"];
            const extension = link.substring(link.lastIndexOf("."));
            if (videoFiles.includes(extension)) {
                this._addVideoTexture(screen, link, fileName);
            } else {
                this._addImageTexture(screen, link, fileName);
            }
        });
    };

    public setVideoVolume = (volume: number, selectedObj: AbstractMesh) => {
        this.editor.afterLoad((scene) => {
            if (!selectedObj) return;
            const videoSound = scene.mainSoundTrack.soundCollection.find((sound) => selectedObj.id === sound.name);
            if (!videoSound) return;
            videoSound.setVolume(volume);
            selectedObj.metadata.data["volume"] = volume;
            this.editor.UIeventEmitter.emit("screenStateChanged", selectedObj.id, selectedObj.metadata.data);
        });
    };

    public setBillboardMode = (screen: AbstractMesh, mode: number) => {
        screen.billboardMode = mode;
        screen.metadata.data.isBillboard = mode === 0 ? false : true;
        this.editor.save();
        this.editor.UIeventEmitter.emit("screenStateChanged", screen.id, screen.metadata.data);
    };

    public updateScreenResolution = (selectedScreen: AbstractMesh, aspectRatioString: string) => {
        if (selectedScreen?.metadata?.type !== "Screen") return;

        const currentScaling = selectedScreen.scaling.clone();
        const currentAspect = selectedScreen.metadata.data.aspectRatio;
        const virtualSize = getSizeFromAspect(currentAspect);

        const virtualScale = currentScaling.x / virtualSize[0];

        const [width, height] = getSizeFromAspect(aspectRatioString);

        selectedScreen.metadata.data.aspectRatio = aspectRatioString;

        selectedScreen.scaling.set(width * virtualScale, height * virtualScale, 1);

        this.editor.UIeventEmitter.emit("sceneGraphChange", () => {});
        this.editor.save();
        this.editor.UIeventEmitter.emit("screenStateChanged", selectedScreen.id, selectedScreen.metadata.data);
    };

    public updateTexture = (selectedScreen: AbstractMesh, link: string, fileName: string) => {
        if (selectedScreen?.metadata?.type !== "Screen") return;
        this.setTexture(selectedScreen, link, fileName);
        this.editor.UIeventEmitter.emit("sceneGraphChange", () => {});
        this.editor.save();
    };

    public removeTexture = (selectedScreen: AbstractMesh) => {
        this.editor.afterLoad((scene) => {
            if (selectedScreen.material) {
                selectedScreen.material.dispose();
                const videoSound = scene.mainSoundTrack.soundCollection.find((sound) => selectedScreen.id === sound.name);
                if (videoSound) {
                    videoSound.name = "";
                    videoSound.stop();
                    videoSound.dispose();
                }
            }
            const material = new StandardMaterial("material", this.editor.scene);
            material.diffuseColor = new Color3(0, 0, 1); // Blue color

            material.backFaceCulling = false;
            selectedScreen.material = material;

            const data = selectedScreen.metadata.data;

            data.videoSources = null;
            data.imageSources = null;
            data.isPlaying = false;
            data.isLooping = false;

            this.editor.UIeventEmitter.emit("screenStateChanged", selectedScreen.id, selectedScreen.metadata.data);
            this.editor.UIeventEmitter.emit("sceneGraphChange", () => {});
            this.editor.save();
        });
    };

    public play = (screen: AbstractMesh) => {
        if (!screen.material) return;
        const material = screen.material as StandardMaterial;
        if (!material.diffuseTexture) return;

        this.editor.afterLoad((scene) => {
            Engine.audioEngine?.audioContext
                ?.resume()
                .then(() => {
                    if (material.diffuseTexture instanceof VideoTexture) {
                        screen.metadata.data.isPlaying = true;
                        material.diffuseTexture?.video?.play();
                        const videoSound = scene.mainSoundTrack.soundCollection.find((sound) => screen.id === sound.name);
                        videoSound?.play();
                        this.editor.UIeventEmitter.emit("screenStateChanged", screen.id, screen.metadata.data);
                    }
                })
                .catch(() => {
                    toast.error("Error while playing video due to broswer's policy, try again");
                });
        });
    };

    public pause = (screen: AbstractMesh) => {
        if (!screen.material) return;
        const material = screen.material as StandardMaterial;
        if (!material.diffuseTexture) return;

        this.editor.afterLoad((scene) => {
            if (material.diffuseTexture instanceof VideoTexture) {
                material.diffuseTexture.video.pause();
                screen.metadata.data.isPlaying = false;
                const videoSound = scene.mainSoundTrack.soundCollection.find((sound) => screen.id === sound.name);
                videoSound?.pause();
                this.editor.UIeventEmitter.emit("screenStateChanged", screen.id, screen.metadata.data);
            }
        });
    };

    public restart = (screen: AbstractMesh) => {
        if (!screen.material) return;
        const material = screen.material as StandardMaterial;
        if (!material.diffuseTexture) return;

        this.editor.afterLoad((scene) => {
            Engine.audioEngine?.audioContext
                ?.resume()
                .then(() => {
                    if (material.diffuseTexture instanceof VideoTexture) {
                        material.diffuseTexture.video.currentTime = 0;
                        material.diffuseTexture.video.play();
                        const videoSound = scene.mainSoundTrack.soundCollection.find((sound) => screen.id === sound.name);
                        videoSound?.stop();
                        videoSound?.play();
                        screen.metadata.data.isPlaying = true;
                        this.editor.UIeventEmitter.emit("screenStateChanged", screen.id, screen.metadata.data);
                    }
                })
                .catch(() => {
                    toast.error("Error while playing video due to broswer's policy, try again");
                });
        });
    };

    public setLoop = (screen: AbstractMesh, loopState?: boolean) => {
        if (!screen.material) return;
        const material = screen.material as StandardMaterial;
        if (!material.diffuseTexture) return;

        this.editor.afterLoad((scene) => {
            if (material.diffuseTexture instanceof VideoTexture) {
                material.diffuseTexture.video.loop = loopState ? loopState : !material.diffuseTexture.video.loop;
                screen.metadata.data.isLooping = material.diffuseTexture.video.loop;
                const videoSound = scene.mainSoundTrack.soundCollection.find((sound) => screen.id === sound.name);
                if (videoSound) {
                    videoSound.loop = material.diffuseTexture.video.loop;
                }
                this.editor.UIeventEmitter.emit("screenStateChanged", screen.id, screen.metadata.data);
            }
        });
    };

    public mount(screen: AbstractMesh) {
        const screenInfo = screen?.metadata.data || {};

        screenInfo.isPlaying = false;
        const defaultLoopState = screenInfo.isLooping || false;
        const defaultAsset = screenInfo.imageSources ? screenInfo.imageSources : screenInfo.videoSources;

        defaultAsset && this.updateTexture(screen, defaultAsset, screenInfo.fileName || "");

        this.setLoop(screen, defaultLoopState);
    }
}
