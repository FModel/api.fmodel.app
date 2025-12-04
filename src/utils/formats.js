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
    }
}