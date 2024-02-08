import { IDBPDatabase, openDB } from "idb";
import toast from "react-hot-toast";
export class Storage {
    private dbPromise: Promise<IDBPDatabase<unknown>>;
    constructor() {
        this.dbPromise = openDB("keyval-store", 1, {
            upgrade(db) {
                db.createObjectStore("keyval");
            },
        });
    }

    public async get(key: string) {
        try {
            return (await this.dbPromise).get("keyval", key);
        } catch (error) {
            toast.error("Soemthing went wrong!", {
                duration: 3000,
            });
        }
    }
    public async set(key: string, val: unknown) {
        try {
            return (await this.dbPromise).put("keyval", val, key);
        } catch (error) {
            toast.error("Soemthing went wrong while saving!", {
                duration: 3000,
            });
        }
    }
    public async del(key: string) {
        try {
            return (await this.dbPromise).delete("keyval", key);
        } catch (error) {
            toast.error("Soemthing went wrong while deleting!", {
                duration: 3000,
            });
        }
    }
    public async clear() {
        try {
            return (await this.dbPromise).clear("keyval");
        } catch (error) {
            toast.error("Soemthing went wrong while clearing!", {
                duration: 3000,
            });
        }
    }
    public async getKey(key: string) {
        try {
            return (await this.dbPromise).getKey("keyval", key);
        } catch (error) {
            toast.error("Soemthing went wrong!", {
                duration: 3000,
            });
        }
    }
    public async keys() {
        try {
            return (await this.dbPromise).getAllKeys("keyval");
        } catch (error) {
            toast.error("Soemthing went wrong!", {
                duration: 3000,
            });
        }
    }
}
