export interface CRUD {
    list: (limit: number, page: number) => Promise<any>;
    create: (resource: any) => Promise<any>;
    getById: (id: string) => Promise<any>;
    putById: (id: string, resource: any) => Promise<string>;
    patchById: (id: string, resource: any) => Promise<string>;
    deleteById: (id: string) => Promise<string>;
}