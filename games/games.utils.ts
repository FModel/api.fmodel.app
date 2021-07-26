class GamesUtils {
    getFieldIndex(fieldName: string) : number {
        switch (fieldName) {
            case "customVersions":
                return 0;
            case "options":
                return 1;
            default:
                return 0;
        }
    }
}

export default new GamesUtils();