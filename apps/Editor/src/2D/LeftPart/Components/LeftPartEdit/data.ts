export interface MeshDataTypes {
    ref: {
        visible: boolean;
    };
    type: string;
}

export interface Item {
    index: string;
    canMove: boolean;
    isFolder: boolean;
    children?: string[];
    data: string;
    meshData?: MeshDataTypes | string; // Assuming it can be either MeshData or string
    canRename: boolean;
}

export interface Items {
    root: Item;
    [key: string]: Item;
}

export interface DataTypes {
    items: Items;
}

export const longTree: DataTypes = {
    items: {
        root: {
            index: "root",
            canMove: true,
            isFolder: true,
            children: ["Donut", "Red", "Green", "Blue", "Yellow", "Orange", "Pink", "Purple", "Light", "LightTwo"],
            data: "root",
            meshData: "root",
            canRename: true,
        },
        Donut: {
            index: "Donut",
            canMove: true,
            isFolder: false,
            data: "Donut",
            meshData: {
                ref: { visible: true },
                type: "Mesh",
            },
            canRename: true,
        },
        Red: {
            index: "Red",
            canMove: true,
            isFolder: false,
            data: "Red",
            meshData: {
                ref: { visible: true },
                type: "Mesh",
            },
            canRename: true,
        },
        Green: {
            index: "Green",
            canMove: true,
            isFolder: false,
            data: "Green",
            meshData: {
                ref: { visible: true },
                type: "Mesh",
            },
            canRename: true,
        },
        Blue: {
            index: "Blue",
            canMove: true,
            isFolder: false,
            data: "Blue",
            meshData: {
                ref: { visible: true },
                type: "Mesh",
            },
            canRename: true,
        },
        Yellow: {
            index: "Yellow",
            canMove: true,
            isFolder: false,
            data: "Yellow",
            meshData: {
                ref: { visible: true },
                type: "Mesh",
            },
            canRename: true,
        },
        Orange: {
            index: "Orange",
            canMove: true,
            isFolder: false,
            data: "Orange",
            meshData: {
                ref: { visible: true },
                type: "Hotspot",
            },
            canRename: true,
        },
        Pink: {
            index: "Pink",
            canMove: true,
            isFolder: false,
            data: "Pink",
            meshData: {
                ref: { visible: true },
                type: "Hotspot",
            },
            canRename: true,
        },
        Purple: {
            index: "Purple",
            canMove: true,
            isFolder: false,
            data: "Purple",
            meshData: {
                ref: { visible: true },
                type: "Hotspot",
            },
            canRename: true,
        },
        Light: {
            index: "Light",
            canMove: true,
            isFolder: false,
            data: "Light",
            meshData: {
                ref: { visible: true },
                type: "Light",
            },
            canRename: true,
        },
        LightTwo: {
            index: "LightTwo",
            canMove: true,
            isFolder: false,
            data: "LightTwo",
            meshData: {
                ref: { visible: true },
                type: "Light",
            },
            canRename: true,
        },
    },
};

// interface Item {
//     name: string;
//     type: string;
//     ref: {
//         // Define the structure of ref object
//     };
// }

// interface TreeData {
//     items: {
//         [key: string]: {
//             index: string;
//             canMove: boolean;
//             isFolder: boolean;
//             children?: string[];
//             data: string;
//             meshData:
//                 | {
//                       ref: {
//                           // Define the structure of ref object
//                       };
//                       type: string;
//                   }
//                 | string;
//             canRename: boolean;
//         };
//     };
// }

// interface TreeTemplate {
//     [key: string]: TreeTemplate | null;
// }

// export const readTemplate = (template: Record<string, null>, data: TreeData = { items: {} }, inputArray: Item[]): TreeData => {
//     for (const [key, value] of Object.entries(template)) {
//         const item = inputArray.find((item) => item.name.charAt(0).toUpperCase() + item.name.slice(1) === key);
//         data.items[key] = {
//             index: key,
//             canMove: true,
//             isFolder: value !== null,
//             children: value !== null ? Object.keys(value as object) : undefined,
//             data: key,
//             meshData: item ? { ref: item.ref, type: item.type } : key,
//             canRename: true,
//         };

//         if (value !== null) {
//             readTemplate(value, data, inputArray);
//         }
//     }
//     return data;
// };

// // Example usage
// const inputArray = [
//     {
//         name: "donut",
//         type: "Mesh",
//         ref: {
//             /* ... */
//         },
//     },
//     {
//         name: "red",
//         type: "Mesh",
//         ref: {
//             /* ... */
//         },
//     },
//     {
//         name: "green",
//         type: "Mesh",
//         ref: {
//             /* ... */
//         },
//     },
//     {
//         name: "blue",
//         type: "Mesh",
//         ref: {
//             /* ... */
//         },
//     },
//     {
//         name: "yellow",
//         type: "Mesh",
//         ref: {
//             /* ... */
//         },
//     },
//     {
//         name: "Orange",
//         type: "Hotspot",
//         ref: {
//             /* ... */
//         },
//     },
//     {
//         name: "Pink",
//         type: "Hotspot",
//         ref: {
//             /* ... */
//         },
//     },
//     {
//         name: "Purple",
//         type: "Hotspot",
//         ref: {
//             /* ... */
//         },
//     },
// ];

// const longTreeTemplate: {
//     root: TreeTemplate;
// } = {
//     root: {},
// };

// inputArray.forEach((item) => {
//     longTreeTemplate.root[item.name.charAt(0).toUpperCase() + item.name.slice(1)] = null;
// });

// export const longTree = readTemplate(longTreeTemplate, undefined, inputArray);
