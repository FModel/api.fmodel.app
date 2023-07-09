import { CreateDonationDto } from '../dto/create.donation.dto';
import debug from 'debug';
import mongooseService from '../../common/services/mongoose.service';

const log: debug.IDebugger = debug('app:donations-dao');

class DonationsDao {
    Schema = mongooseService.getMongoose().Schema;

    donationSchema = new this.Schema({
        _id: String,
        username: String,
        total: { type:Number, default:0.0 },
        count: { type:Number, default:1 }
    });

    Donation = mongooseService.getMongoose().model('Donations', this.donationSchema);

    constructor() {
        log('Created new instance of DonationsDao');
    }

    async addDonation(donationFields: CreateDonationDto) {
        const donation = new this.Donation({
            _id: donationFields.payerId,
            ...donationFields
        });
        await donation.save();
    }

    async getDonationById(donationId: string) {
        return this.Donation.findOne({ _id: donationId }).exec();
    }

    async getDonationByUsername(username: string) {
        return this.Donation.findOne({ username: username }).exec();
    }

    async getDonations(limit = 25, page = 0) {
        return this.Donation.find().limit(limit).skip(limit * page).sort({count: -1}).select('-_id -total -__v').exec();
    }
    
    async updateDonationById(donationId: string, increment: number) {
        return await this.Donation.findOneAndUpdate(
            { _id: donationId },
            // @ts-ignore
            {$inc: {total: increment, count: 1}},
            { new: true }
        ).exec();
    }

    async removeDonationById(donationId: string) {
        return this.Donation.deleteOne({ _id: donationId }).exec();
    }
}

export default new DonationsDao();