module.exports = {
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Byte';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    formatDate(date, dayOffset = -1) {
        const d = new Date(date).setDate(date.getDate() + dayOffset);
        return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    },
    
    formatNumber(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    parseEngineVersion(fileName) {
        const isEngine = (major, minor) => ({ 3: minor === 0, 4: minor <= 27, 5: minor <= 9, 6: minor <= 9 })[major];
        const patterns = [
            /UE([3-6])\+*Release-\1\.(\d{1,2})(?!\d)/gi,       // perforce branch: "+++UE4+Release-4.26-Nuts", "0UE5Release-5.1-MultiVersus"
            /(?<![\d.])([3-6])\.(\d{1,2})\.\d+(?:\.\d+)?/g,    // full version: "5.6.1-44394996+++...", "FMF2-5.3.2", "SonicCrossWorld5.4.3-0", "AION2-5.3.2.0-1.0.34.0"
            /^([3-6])(\d{2})_/g,                                // packed version: "503_Valorant" -> 5.3
            /^([3-6])\.(\d{1,2})_/g,                            // short version prefix: "5.1_24628_InfinityNikki"
        ];
        for (const pattern of patterns) {
            for (const [, major, minor] of fileName.matchAll(pattern)) {
                if (isEngine(Number(major), Number(minor))) return `${major}.${Number(minor)}`;
            }
        }
        return undefined;
    }
}