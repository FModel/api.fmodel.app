import DictionariesDao from '../daos/dictionaries.dao';

class DictionariesService {
    async getByKey(joinId: string, key: string) {
        return DictionariesDao.getByJoinIdAndKey(joinId, key);
    }
}

export default new DictionariesService();