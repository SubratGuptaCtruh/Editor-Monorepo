import { Storage } from "./3D/EditorLogic/Storage";
import { ResponseData } from "./3D/EditorLogic/editor";

const sw = self as unknown as ServiceWorkerGlobalScope;

const DBStorage = new Storage();

function extractSceneId(url: string) {
    const scenesIndex = url.indexOf("/scenes/");
    if (scenesIndex === -1) {
        return null;
    }

    const start = scenesIndex + "/scenes/".length;
    const end = url.indexOf("/", start);

    if (end === -1) {
        return url.substring(start);
    } else {
        return url.substring(start, end);
    }
}

function extractUserId(url: string) {
    const startIndex = url.indexOf("user-");
    if (startIndex === -1) {
        return null;
    }
    const userIdStart = startIndex + "user-".length;
    const endIndex = url.indexOf("/", userIdStart);
    const userId = endIndex === -1 ? url.slice(userIdStart) : url.slice(userIdStart, endIndex);
    return userId;
}

async function getLatestVersionNumber(userId: string, sceneId: string) {
    const myRequest = new Request("https://ctruhgateway.azurewebsites.net/getEditorData?userId=" + userId + "&sceneId=" + sceneId, {
        method: "GET",
        //TODO : use env vars
        headers: new Headers({
            "X-Api-Key": "HWBTAMvPXIwM8yJBU5DGFIuVchOxPwtb",
        }),
    });
    try {
        const response = await fetch(myRequest);
        const data = await response.json();
        const latestVersion = data.version;
        return latestVersion;
    } catch (error) {
        return undefined;
    }
}
const IdbRes = () => {
    const responseData: ResponseData = { LoadFrom: "IDB" };
    return new Response(JSON.stringify(responseData), {
        headers: {
            "Content-Type": "application/json",
        },
        status: 200,
        statusText: "OK",
    });
};
const DefualtRes = () => {
    const responseData: ResponseData = { LoadFrom: "DEFUALT" };
    return new Response(JSON.stringify(responseData), {
        headers: {
            "Content-Type": "application/json",
        },
        status: 200,
        statusText: "OK",
    });
};
const FetchRes = async (event: FetchEvent, serverVirson: number, sceneId: string) => {
    await DBStorage.set(`${sceneId}-version`, serverVirson);
    return fetch(event.request);
};
async function returnRes(event: FetchEvent) {
    const userId = extractUserId(event.request.url);
    const sceneId = extractSceneId(event.request.url);
    if (!DBStorage) throw Error("INDEX DB dose Not exst");
    if (!userId || !sceneId) throw Error("no USER or sceneId exgist");
    const isSceneInIDB = await DBStorage.getKey(sceneId);
    const LocalVir = await DBStorage.get(`${sceneId}-version`);

    const serverVirson = await getLatestVersionNumber(userId, sceneId).catch((err) => {
        console.error(err, "sdbhv");
    });
    const isbothVirsonUndifind = LocalVir === undefined && serverVirson === undefined;
    const isbothValidVirson = Number.isInteger(LocalVir) && Number.isInteger(serverVirson);
    if (isbothVirsonUndifind && isSceneInIDB === undefined) {
        return DefualtRes();
    }
    if (isbothVirsonUndifind && isSceneInIDB) {
        return IdbRes();
    }
    if (LocalVir === undefined && Number.isInteger(serverVirson)) {
        return FetchRes(event, serverVirson, sceneId);
    }
    if (isbothValidVirson && serverVirson !== LocalVir) {
        return FetchRes(event, serverVirson, sceneId);
    }
    if (isbothValidVirson && serverVirson === LocalVir) {
        return IdbRes();
    }
    throw Error("did't match any possibel case");
}

sw.addEventListener("fetch", (event) => {
    console.log(event.request.method, "gvuhi");
    if (event.request.url.includes("split") && event.request.url.includes("model") && event.request.method === "GET") {
        console.log(event.request.method, "gvuhi");
        event.respondWith(
            caches.open("texturs").then((cache) => {
                return cache.match(event.request.url, { ignoreVary: true }).then((response) => {
                    return response || fetch(event.request);
                });
            })
        );
    } else if (event.request.url.includes("scenes") && event.request.url.includes("jsonFile")) {
        //Caching mechanism for scene json data
        event.respondWith(
            returnRes(event).then((res) => {
                return res;
            })
        );
    }
});
