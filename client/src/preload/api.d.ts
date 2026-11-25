export interface Api {
    session: {
        save: (token: string) => Promise<boolean>
        load: () => Promise<string | null>
        clear: () => Promise<void>
    }
}