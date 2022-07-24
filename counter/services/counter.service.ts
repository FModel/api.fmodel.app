import CounterDao from '../daos/counter.dao';

class CounterService {
    async increment(key: string) {
        return CounterDao.increment(key);
    }
}

export default new CounterService();