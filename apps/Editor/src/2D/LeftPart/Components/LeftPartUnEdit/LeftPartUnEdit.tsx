import { AbstractMesh, Mesh, TransformNode } from "@babylonjs/core";
import { useAtom, useSetAtom } from "jotai";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { ControlledTreeEnvironment, InteractionMode, Tree, TreeItem, TreeItemIndex, TreeItemRenderContext } from "react-complex-tree";
import toast from "react-hot-toast";
import { DuplicateScreenCommand, RemoveObjCommand, RemoveScreenCommand } from "../../../../3D/EditorLogic/commands";
import { AddDuplicateCameraCommand, RemoveCameraCommand } from "../../../../3D/EditorLogic/commands/AddCameraCommand/AddCameraCommand";
import { AddDuplicatedMeshCommand } from "../../../../3D/EditorLogic/commands/AddDuplicatedMeshCommand/AddDuplicatedMeshCommand";
import { DuplicateSpatialAudioCommand, RemoveSpatialAudio } from "../../../../3D/EditorLogic/commands/AddSpatialAudio/AddSpatialAudio";
import { RenameCommand } from "../../../../3D/EditorLogic/commands/RenameCommand/RenameCommand";
import { MeshType, editor } from "../../../../3D/EditorLogic/editor";
import { calculateBoundingInfo, isEmptyMesh } from "../../../../3D/EditorLogic/hoverInteraction";
import { LightSystem } from "../../../../3D/EditorLogic/lights";
import { exportItemAtom, exportModalAtom, menuPositionAtom } from "../../../../store/store";
import ContextMenu from "../../../Components/ContextMenu/ContextMenu";
import MultiSelect from "../../../Components/MultiSelect/MultiSelect";
import { useSecneHiriecryGraph } from "../../../Hooks/useGetHiriceryGraph";
import { useSelectedState } from "../../../Hooks/useSelected";
import {
    Audio,
    Background,
    CameraIcon,
    Contentcopy,
    Delete,
    DownloadIcons,
    Edit,
    FocusIcon,
    Light,
    Shapes,
    SlideShowIcon,
    Text,
    Visibilityoff,
    Visibiltiy,
} from "../../icons/icons";
import { Item, MeshDataTypes } from "../LeftPartEdit/data";
import styles from "./LeftPartUnEdit.module.css";
export interface CustomTreeItem extends TreeItem {
    meshData?: MeshDataTypes;
}

function LeftPartUnEdit() {
    const [menuPosition, setMenuPosition] = useAtom(menuPositionAtom);
    const [contextData, setContextData] = useState<CustomTreeItem>();

    const longTree = useSecneHiriecryGraph(editor);
    const selected = useSelectedState(editor);
    const [selectedFilterArray, setSelectedFilterArray] = useState<string[]>([]);
    const [focusedItem, setFocusedItem] = useState<TreeItemIndex>();
    const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
    const setExportModal = useSetAtom(exportModalAtom);
    const setExportItem = useSetAtom(exportItemAtom);
    const tree = useRef(null);
    useEffect(() => {
        console.log(selected, "selected");
        setFocusedItem(selected?.uniqueId.toString() as TreeItemIndex);
        // setExpandedItems((prevExpandedItems) => [...prevExpandedItems, selected?.uniqueId.toString() as TreeItemIndex]);
        const focusedItem = document.querySelector(".rct-tree-item-li-focused");
        if (focusedItem) {
            focusedItem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [selected]);

    // function for selecting tabs

    const handleSelectedArrray = (data: string[]) => {
        console.log(data, "fsgeybih");
        setSelectedFilterArray(data);
    };
    const menu = [
        {
            title: "Rename",
            icons: <Edit />,
            tab: "rename",
            onclick: (data: CustomTreeItem) => handleRename(data),
        },
        // Exclude the "Duplicate" option for directionallight type
        ...(selected?.metadata.type !== "DirectionLight"
            ? [
                  {
                      title: "Duplicate",
                      icons: <Contentcopy />,
                      tab: "duplicate",
                      onclick: (data: CustomTreeItem) => handleDuplicate(data),
                  },
              ]
            : []),
        {
            title: (contextData?.meshData?.ref as unknown as TransformNode | Mesh | AbstractMesh)?.isEnabled() ? "Hide" : "Unhide",
            icons: (contextData?.meshData?.ref as unknown as TransformNode | Mesh | AbstractMesh)?.isEnabled() ? <Visibiltiy /> : <Visibilityoff />,
            tab: "hide",
            onclick: (data: CustomTreeItem) => handleVisibility(data),
        },
        {
            title: "Delete",
            icons: <Delete />,
            tab: "delete",
            onclick: (data: CustomTreeItem) => handleDelete(data),
        },
        {
            title: "Export",
            icons: <DownloadIcons />,
            tab: "export",
            onclick: (data: CustomTreeItem) => handleExport(data),
        },
    ];

    const handleVisibility = (data: CustomTreeItem) => {
        console.log(data, "visibiltyData");
        handleSelected(data);
        if (!editor.selector.selected) {
            return;
        }

        editor.handleMeshVisibility();
        setContextData(undefined);
        // setContextData(undefined);
    };

    const handleDelete = (data: CustomTreeItem) => {
        handleSelected(data);
        if (!editor.selector.selected) return;
        if (editor.selector.selected.metadata.type === "Camera") {
            editor.executer(new RemoveCameraCommand(editor, editor.selector.selected));
            setContextData(undefined);
            return;
        } else if (editor.selector.selected.metadata.type === "Screen") {
            editor.executer(new RemoveScreenCommand(editor, editor.selector.selected));
            setContextData(undefined);
            return;
        } else if (editor.selector.selected.metadata.type === "SpatialAudio") {
            editor.executer(new RemoveSpatialAudio(editor, editor.selector.selected));
            setContextData(undefined);
            return;
        }
        try {
            LightSystem.validateLightMesh(editor.selector.selected).lightType;
            editor.executer(new RemoveObjCommand(editor, editor.selector.selected, true));
        } catch (error) {
            editor.executer(new RemoveObjCommand(editor, editor.selector.selected, false));
        }
        setContextData(undefined);
    };

    const handleDuplicate = (data: CustomTreeItem) => {
        handleSelected(data);
        if (!editor.selector.selected) return;

        const name: string = editor.selector.selected.name + "_Copy";
        if (editor.selector.selected.metadata.type === "Camera") {
            editor.executer(new AddDuplicateCameraCommand(editor, editor.selector.selected));
        } else if (editor.selector.selected.metadata.type === "Screen") {
            editor.executer(new DuplicateScreenCommand(editor, editor.selector.selected));
        } else if (editor.selector.selected.metadata.type === "SpatialAudio") {
            editor.executer(new DuplicateSpatialAudioCommand(editor, editor.selector.selected));
        } else {
            editor.executer(new AddDuplicatedMeshCommand(editor, name, editor.selector.selected));
        }
        setContextData(undefined);
    };
    // Define a type for the button refs
    type ButtonRefsType = Record<number, HTMLButtonElement | null>;

    // Create a ref for buttonRefs
    const buttonRefs: RefObject<ButtonRefsType> = useRef({});
    // const buttonRefs = useRef<HTMLButtonElement>(null);
    const handleRename = (data: CustomTreeItem) => {
        handleSelected(data);

        handleSelected(data);
        if (buttonRefs.current && buttonRefs.current[data.data]) buttonRefs?.current[data.data]?.click();
        setContextData(undefined);
    };

    const handleExport = (data: CustomTreeItem) => {
        if (!editor.selector.selected) return;
        setExportModal(true);
        setExportItem(data);
        // editor.export({fileFormat : "GLB", fileName : editor.selector.selected.name, object : editor.selector.selected});
        // console.log(data, "export");
    };

    const handleSelected = (item: CustomTreeItem) => {
        const mesh = editor.scene.getMeshByUniqueId(parseInt(item.index as string));
        if (!mesh) {
            const mesh = editor.scene.getTransformNodeByUniqueId(parseInt(item.index as string));
            // editor.selector.select(mesh as AbstractMesh);
            editor.selectionLayer.directSelection(mesh as AbstractMesh);
        } else {
            editor.selectionLayer.directSelection(mesh as AbstractMesh);
        }
    };

    const handleContext = (data: CustomTreeItem, e: React.MouseEvent) => {
        const boundingBox = e.currentTarget.getBoundingClientRect();
        const computedStyles = getComputedStyle(e.currentTarget);

        const rctArrowContainerSize = computedStyles.getPropertyValue("--rct-arrow-container-size");
        const rctArrowContainerSizeNum = Number(rctArrowContainerSize.substring(0, rctArrowContainerSize.length - 2));

        const rctArrowPadding = computedStyles.getPropertyValue("--rct-arrow-padding");
        const rctArrowPaddingNum = Number(rctArrowPadding.substring(0, rctArrowPadding.length - 2));

        const menuPositionLeft = boundingBox.left + boundingBox.width - rctArrowContainerSizeNum - rctArrowPaddingNum - 15;

        e.preventDefault();
        console.log(data, "handleContext");
        setMenuPosition({ left: menuPositionLeft, top: e.clientY - 360 });
        setContextData(data);
    };
    type List = { [key: string]: Item };
    const filterDataFromDropDown = (types: string[]): List => {
        if (types.length === 0) {
            return filterDataFromDropDown([
                "TransformNode",
                "Mesh",
                "Camera",
                "TransformNode",
                "Mesh",
                "SpatialAudio",
                "Screen",
                "Text",
                "TransformNode",
                "Mesh",
                "SpotLight",
                "PointLight",
                "DirectionLight",
                "TransformNode",
                "Mesh",
            ]); // Return the entire data if types array is empty
        }

        const filteredDataKey = Object.keys(longTree.items).filter((key) => {
            const item = longTree.items[key];
            return item.meshData && types.includes((item.meshData as MeshDataTypes).type) && key !== "root";
        });

        const filteredData = filteredDataKey.reduce(
            (acc, key: string) => {
                const item = longTree.items[key];
                if (item.isFolder && item.children) {
                    const filteredChildren = item.children.filter((childKey: string) => {
                        const childItem = longTree?.items[childKey];
                        if (childItem && childItem.meshData && (childItem.meshData as MeshDataTypes).type) return types.includes((childItem.meshData as MeshDataTypes).type);
                        return false;
                    });
                    acc[key] = { ...item, children: filteredChildren };
                } else {
                    acc[key] = item;
                }
                return acc;
            },
            {} as { [key: string]: Item }
        );

        const isFolderChildren: string[] = [];
        Object.keys(filteredData).forEach((key) => {
            const item = filteredData[key];
            if (item.isFolder && item.children) {
                isFolderChildren.push(...item.children);
            }
        });

        const finalArray = filteredDataKey.filter((item) => !isFolderChildren.includes(item));

        // Include the root key in the filtered data
        filteredData["root"] = {
            ...longTree.items["root"],
            children: finalArray,
        };

        return filteredData;
    };
    const meshData = filterDataFromDropDown(selectedFilterArray);
    const treeItemsState = { root: longTree.items.root, ...meshData };
    const selectedList = selected ? [selected.uniqueId.toString() as TreeItemIndex] : ([] as TreeItemIndex[]);
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
        .rct-tree-item-title-container:hover h4 {
            color: var(--rct-color-focustree-item-hover-text)
        }
        .rct-tree-item-title-container-selected .rct-tree-item-button {
            fill: var(--rct-color-focustree-item-selected-text);
        }
        .rct-tree-item-title-container-selected h4 {
            color: var(--rct-color-focustree-item-selected-text)
        }
        .rct-tree-item-button:hover{
            fill: var(--rct-color-focustree-item-hover-text)
        }
        .rct-tree-item-li.no-child .rct-tree-item-button {
            padding: 0 var(--rct-item-padding) 0 0.5rem
        }
      `}
            </style>
            {contextData && <ContextMenu menuPosition={menuPosition} clickedData={contextData} menu={menu} />}

            <MultiSelect
                onChange={(data) => handleSelectedArrray(data)}
                data={[
                    { label: "Hotspot", values: ["Camera"], checked: true },
                    { label: "Media", values: ["SpatialAudio", "Screen", "Text"], checked: true },
                    { label: "Light", values: ["SpotLight", "PointLight", "DirectionLight"], checked: true },
                    { label: "Mesh", values: ["TransformNode", "Mesh"], checked: true },
                ]}
            />
            <div className={styles.leftPartOptions}>
                {
                    <>
                        <div className={styles.leftPartFeature}>
                            <div className={styles.allInfo}>
                                <CameraIcon />
                                <h6>System Camera</h6>
                            </div>
                        </div>
                        <div
                            className={styles.leftPartFeature}
                            onClick={() => {
                                editor.selector.deselect();
                            }}
                        >
                            <div className={styles.allInfo}>
                                <Background />
                                <h6>Background</h6>
                            </div>
                        </div>
                    </>
                }

                <>
                    {treeItemsState && (
                        <>
                            <ControlledTreeEnvironment
                                items={treeItemsState}
                                renderItem={({
                                    item,
                                    depth,
                                    children,
                                    title,
                                    context,
                                    arrow,
                                }: {
                                    item: CustomTreeItem;
                                    depth: number;
                                    children: React.ReactNode;
                                    title: React.ReactNode;
                                    arrow: React.ReactNode;
                                    context: TreeItemRenderContext<never>;
                                }) => {
                                    const interactiveComponentTag = context.isRenaming ? "div" : "button";
                                    const type = context.isRenaming ? undefined : "button";
                                    // Constructing class names
                                    const itemContainerClasses = [
                                        "rct-tree-item-li",
                                        context.isSelected && "rct-tree-item-li-selected",
                                        context.isExpanded && "rct-tree-item-li-expanded",
                                        context.isFocused && "rct-tree-item-li-focused",
                                        context.isDraggingOver && "rct-tree-item-li-dragging-over",
                                        context.isSearchMatching && "rct-tree-item-li-search-match",
                                    ]
                                        .filter(Boolean)
                                        .join(" ");

                                    const titleContainerClasses = [
                                        "rct-tree-item-title-container",
                                        context.isSelected && "rct-tree-item-title-container-selected",
                                        context.isExpanded && "rct-tree-item-title-container-expanded",
                                        context.isFocused && "rct-tree-item-title-container-focused",
                                        context.isDraggingOver && "rct-tree-item-title-container-dragging-over",
                                        context.isSearchMatching && "rct-tree-item-title-container-search-match",
                                    ]
                                        .filter(Boolean)
                                        .join(" ");

                                    const buttonClasses = [
                                        "rct-tree-item-button",
                                        context.isSelected && "rct-tree-item-button-selected",
                                        context.isExpanded && "rct-tree-item-button-expanded",
                                        context.isFocused && "rct-tree-item-button-focused",
                                        context.isDraggingOver && "rct-tree-item-button-dragging-over",
                                        context.isSearchMatching && "rct-tree-item-button-search-match",
                                    ]
                                        .filter(Boolean)
                                        .join(" ");

                                    const noChildrenClass = item.children && item.children.length > 0 ? "" : "no-child";

                                    return (
                                        <li
                                            {...context.itemContainerWithChildrenProps}
                                            className={`${itemContainerClasses} ${noChildrenClass}`}
                                            onContextMenu={(e) => {
                                                e.stopPropagation(), e.preventDefault(), handleContext(item, e);
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation(), e.preventDefault(), handleSelected(item), setMenuPosition({});
                                            }}
                                        >
                                            <div
                                                {...context.itemContainerWithoutChildrenProps}
                                                style={{
                                                    paddingLeft: depth >= 1 ? `calc(${(depth + 1) * 20}px` : "8px",
                                                }}
                                                className={titleContainerClasses}
                                            >
                                                {arrow}
                                                {React.createElement(
                                                    interactiveComponentTag,
                                                    {
                                                        type,
                                                        ...context.interactiveElementProps,
                                                        className: buttonClasses,
                                                    },
                                                    <>
                                                        <div
                                                            className={styles.title}
                                                            onContextMenu={(e) => handleContext(item, e)}
                                                            onPointerEnter={() => {
                                                                if (item.meshData?.ref) {
                                                                    const node = item.meshData.ref as unknown as AbstractMesh;
                                                                    const isText = item.meshData.type === "Text";
                                                                    const interactMesh = isText ? ((item.meshData.ref as unknown as Mesh).getChildren()[0] as AbstractMesh) : node;
                                                                    const isEmpty = !isText && isEmptyMesh(interactMesh as Mesh);
                                                                    if (isEmpty) {
                                                                        calculateBoundingInfo(interactMesh as Mesh);
                                                                    }
                                                                    editor.hoverInteraction.setHoveredMesh(interactMesh);
                                                                }
                                                            }}
                                                            onPointerLeave={() => {
                                                                if (item.meshData?.ref) {
                                                                    //TODO : Change to correct type
                                                                    editor.hoverInteraction.setHoveredMesh(null);
                                                                }
                                                            }}
                                                        >
                                                            {(() => {
                                                                if ((item.meshData?.ref as unknown as TransformNode | Mesh | AbstractMesh).isEnabled() === false)
                                                                    return <Visibilityoff />;
                                                                else {
                                                                    switch (item.meshData?.type as MeshType) {
                                                                        case "Mesh":
                                                                            return <Shapes />;
                                                                        case "Camera":
                                                                            return <CameraIcon />;
                                                                        case "SpotLight":
                                                                            return <Light />;
                                                                        case "PointLight":
                                                                            return <Light />;
                                                                        case "DirectionLight":
                                                                            return <Light />;
                                                                        case "SpatialAudio":
                                                                            return <Audio />;
                                                                        case "Text":
                                                                            return <Text />;
                                                                        case "Screen":
                                                                            return <SlideShowIcon />;
                                                                        default:
                                                                            return <Shapes />;
                                                                    }
                                                                }
                                                            })()}

                                                            <h4>{title}</h4>
                                                            <div
                                                                onClick={() => {
                                                                    const hotspotInPreview = editor.hotspotSystem.currentHotspotInPreveiw;
                                                                    if (hotspotInPreview) {
                                                                        toast.error("Can't adjust focus in Preview Mode");
                                                                    } else {
                                                                        editor.focusOnObjects(selected as AbstractMesh);
                                                                    }
                                                                }}
                                                                style={{ paddingLeft: depth === 0 ? "0px" : "10px" }}
                                                            >
                                                                {(item.meshData?.ref as unknown as TransformNode | Mesh | AbstractMesh).isEnabled() === true ? <FocusIcon /> : ""}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                <button
                                                    onClick={context?.startRenamingItem}
                                                    ref={(ref) => {
                                                        // Create a unique ref for each button
                                                        if (buttonRefs.current) buttonRefs.current[item.data] = ref;
                                                    }}
                                                    type="button"
                                                    style={{ display: "none" }}
                                                >
                                                    Rename
                                                </button>
                                            </div>
                                            {children}
                                        </li>
                                    );
                                }}
                                onExpandItem={(item) => setExpandedItems([...expandedItems, item.index])}
                                onCollapseItem={(item) => setExpandedItems(expandedItems.filter((expandedItemIndex) => expandedItemIndex !== item.index))}
                                onFocusItem={(item) => setFocusedItem(item.index)}
                                onSelectItems={(items) => {
                                    console.log(items, "items");
                                }}
                                onRenameItem={(item, name) => {
                                    setContextData(item);
                                    item.data = name;
                                    if (selected) editor.executer(new RenameCommand(editor, selected, name));
                                }}
                                getItemTitle={(item) => item.data}
                                defaultInteractionMode={InteractionMode.ClickItemToExpand}
                                viewState={{
                                    "tree-1": {
                                        focusedItem,
                                        expandedItems: expandedItems,
                                        selectedItems: selectedList,
                                    },
                                }}
                            >
                                <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" ref={tree} />
                            </ControlledTreeEnvironment>
                        </>
                    )}
                </>
            </div>
        </>
    );
}

export default LeftPartUnEdit;
