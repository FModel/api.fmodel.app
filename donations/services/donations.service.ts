import DonationsDao from '../daos/donations.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateDonationDto } from '../dto/create.donation.dto';

class DonationsService implements CRUD {
    async list(limit: number, page: number) {
        return DonationsDao.getDonations(limit, page);
    }

    async create(resource: CreateDonationDto) {
        return DonationsDao.addDonation(resource);
    }

    async getById(donationId: string) {
        return DonationsDao.getDonationById(donationId);
    }

    async putById(donationId: string, increment: number) : Promise<any> {
        return DonationsDao.updateDonationById(donationId, increment);
    }

    async patchById(donationId: string, increment: number) : Promise<any> {
        return DonationsDao.updateDonationById(donationId, increment);
    }

    async deleteById(donationId: string) {
        return DonationsDao.removeDonationById(donationId);
    }

    async getDonationByUsername(username: string) {
        return DonationsDao.getDonationByUsername(username);
    }
    
}

export default new DonationsService();