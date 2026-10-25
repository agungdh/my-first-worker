import { BidangRepository } from "../modules/bidang/bidang.repository";
import { BidangService } from "../modules/bidang/bidang.service";
import { PangkatGolonganRepository } from "../modules/pangkat-golongan/pangkat-golongan.repository";
import { PangkatGolonganService } from "../modules/pangkat-golongan/pangkat-golongan.service";
import { PegawaiRepository } from "../modules/pegawai/pegawai.repository";
import { PegawaiService } from "../modules/pegawai/pegawai.service";

export interface Services {
	pegawai: PegawaiService;
	bidang: BidangService;
	pangkatGolongan: PangkatGolonganService;
}

export function buildServices(env: Env): Services {
	const bidangRepo = new BidangRepository(env.DB);
	const pangkatGolonganRepo = new PangkatGolonganRepository(env.DB);

	return {
		pegawai: new PegawaiService(new PegawaiRepository(env.DB), bidangRepo, pangkatGolonganRepo),
		bidang: new BidangService(bidangRepo),
		pangkatGolongan: new PangkatGolonganService(pangkatGolonganRepo),
	};
}
