import GenerateUri from "./helpers/GenerateUri";
import Wayback from "./helpers/Wayback";
import ExtraData from "./interfaces/ExtraData";
import Getter from "./helpers/Getter";
import Scrape from "./helpers/Scrape";
import Sleep from "./utils/Sleep";
import MergeData from "./types/MergeData";
import ArrayExtended from "./utils/ArrayExtended";
import Save from "./utils/Save";
import Environment from "./config/Environment";
import path from "path";

const main = async () => {
	const dir = path.resolve(__dirname, "../public");
	const generateUri = new GenerateUri(Environment.URL);
	const offerLinks = generateUri.getOfferLinks();
	let allData = [] as MergeData[];
	for (const offer of offerLinks) {
		const uri = offer.uri;
		const localArea = offer.localArea;
		const wayback = new Wayback(uri);
		const list = await wayback.getList();
		for (const link of list) {
			const url = link.uri;
			const date = link.datetime;
			const extraData = {localArea, date} as ExtraData;
			await Sleep.sleep(4000);
			const getter = await Getter.build(url);
			const html = getter.html;
			if(html) {
				const scrape = new Scrape(html, extraData);
				const data = scrape.getMergeData();
				allData = allData.concat(data);
			}
		}
	}
	const csv = ArrayExtended.jsonToCsv(allData);
	Save.toCsv(csv, "data", dir);
};

main();