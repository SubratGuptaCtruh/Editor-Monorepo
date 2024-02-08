import { useLayoutEffect, useState } from "react";
import { InteractionMode, StaticTreeDataProvider, Tree, TreeItemIndex, UncontrolledTreeEnvironment } from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { editor } from "../../../../3D/EditorLogic/editor";
import { useSecneHiriecryGraph } from "../../../Hooks/useGetHiriceryGraph";
import { DragIcons } from "../../icons/icons";
import styles from "./LeftPartEdit.module.css";
import { Items } from "./data";

function LeftPartEdit() {
    const [, setItemSelected] = useState<TreeItemIndex[]>([]);
    // const [folderCount, setFolderCount] = useState(0);
    const [treeItemsState, setTreeItemsState] = useState<Items>();
    const longTree = useSecneHiriecryGraph(editor);
    // const handleNewFolderCreation = () => {
    //     // whenever this function called folder count has to increase by one
    //     setFolderCount(folderCount + 1);
    //     const folderName = `Folder-${folderCount}`;

    //     // getting initalTree data
    //     const initalTree = longTree.items;

    //     // this loop is for removing the selected items from the children array
    //     for (const key in initalTree) {
    //         if (Object.prototype.hasOwnProperty.call(initalTree, key)) {
    //             const childObject = initalTree[key];
    //             if (Object.prototype.hasOwnProperty.call(childObject, "children")) {
    //                 itemSelected.forEach((value) => {
    //                     const index = childObject.children?.indexOf(value as string);
    //                     if (index !== -1) {
    //                         childObject.children?.splice(index as number, 1);
    //                     }
    //                 });
    //             }
    //         }
    //     }

    //     // this will create the new folder in the tree
    //     longTree.items = {
    //         ...initalTree,
    //         [folderName]: {
    //             canMove: true,
    //             canRename: true,
    //             children: itemSelected as string[],
    //             data: folderName,
    //             index: folderName,
    //             isFolder: true,
    //         },
    //     };

    //     // we have to pass the newly create folder into root children
    //     if (longTree.items["root"].children) {
    //         longTree.items["root"].children = [folderName, ...longTree.items["root"].children];
    //     }

    //     // setting the updated json
    //     setTreeItemsState(longTree.items);
    // };

    // delete function
    // const handleDelete = () => {
    //     // getting initial data
    //     const initalTree = { ...longTree.items };

    //     // this loop is for removing the selected items from the children array and also removing entries from the object
    //     for (const key in initalTree) {
    //         // this logic remove the values from children array of folder
    //         if (Object.prototype.hasOwnProperty.call(initalTree, key)) {
    //             const childObject = initalTree[key];
    //             if (Object.prototype.hasOwnProperty.call(childObject, "children")) {
    //                 childObject.children = childObject.children?.filter((child: string) => !itemSelected.includes(child));
    //             }
    //         }

    //         // this will delete the entries from the object
    //         if (itemSelected.includes(key)) {
    //             delete initalTree[key];
    //             if (initalTree["root"]?.children?.includes(key)) {
    //                 initalTree["root"].children = initalTree["root"].children.filter((child: string) => child !== key);
    //             }
    //         }
    //     }

    //     // setting the updated json
    //     setTreeItemsState(initalTree);
    // };
    useLayoutEffect(() => {
        setTreeItemsState(longTree.items);
    }, [longTree.items]);

    return (
        <>
            <style>
                {`
        :root {
          --rct-color-tree-bg: none;
          --rct-color-tree-focus-outline: none;

          --rct-color-focustree-item-selected-bg: #f0f2f5;
          --rct-color-focustree-item-selected-text:#3D75F3;
          --rct-color-focustree-item-draggingover-bg: #ecdede;
          --rct-color-focustree-item-draggingover-color: inherit;
          --rct-item-height: 32px;

          --rct-color-focustree-item-hover-bg: #f0f2f569;
          --rct-color-focustree-item-hover-text:  #3D75F3;
   

          --rct-color-focustree-item-draggingover-bg: #3D75F3;
          --rct-color-focustree-item-draggingover-color: #fff;

          --rct-arrow-size: 14px;
          --rct-arrow-container-size: 16px;
          --rct-arrow-padding: 6px;
          --rct-color-arrow: #323232;
        
        }

        .rct-tree-item-li{
            font-family: Outfit;
            font-size: 16px;
            font-style: normal;
            font-weight: 350;
            line-height: 20px; 
        }
      `}
            </style>
            <div className={styles.leftPartEditMainContainer}>
                <div className={styles.leftPartEditHeader}>
                    {/* <div onClick={() => handleNewFolderCreation()}>
                        <FolderIcons />
                    </div> */}
                </div>
                <section className={styles.LeftPartEditLayer}>
                    <>
                        {treeItemsState && (
                            <>
                                <UncontrolledTreeEnvironment
                                    dataProvider={
                                        new StaticTreeDataProvider(treeItemsState, (item, data) => ({
                                            ...item,
                                            data,
                                        }))
                                    }
                                    canDragAndDrop
                                    canDropOnFolder
                                    canReorderItems
                                    renderItemTitle={({ title }) => (
                                        <span className={styles.itemDetails}>
                                            {`${title.substring(0, 18)}${title.length >= 19 ? "..." : ""}`} <DragIcons />
                                        </span>
                                    )}
                                    // onFocusItem={(e) => console.log(e)}
                                    onSelectItems={(e: TreeItemIndex[]) => {
                                        console.log(e, "hcvssc");
                                        const meshes = e.map((uid) => {
                                            const mesh = editor.scene.getMeshByUniqueId(parseInt(uid.toString()));
                                            if (mesh === null) {
                                                console.error("no mesh found with id", uid);
                                                throw Error("no mesh found with id");
                                            } else {
                                                return mesh;
                                            }
                                        });
                                        if (meshes.length > 1) {
                                            editor.selector.selectMultiple(meshes);
                                        }
                                        setItemSelected(e);
                                    }}
                                    getItemTitle={(item) => item.data}
                                    defaultInteractionMode={InteractionMode.ClickItemToExpand}
                                    viewState={{
                                        "tree-1": {
                                            expandedItems: ["Fruit"],
                                        },
                                    }}
                                >
                                    <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
                                </UncontrolledTreeEnvironment>
                            </>
                        )}
                    </>
                </section>
            </div>
        </>
    );
}

export default LeftPartEdit;
